import APIError from '@/components/api/user/APIError'
import { clearSessionToken } from '@/composables/useDesktopToken'

class BaseAPIService {
    // Shared across every service instance, so two different services asking for
    // the same list still make one request.
    private static readonly inflightRequests = new Map<string, Promise<any>>()

    private static readonly referenceCache = new Map<string, { at: number; data: any }>()

    /**
     * Lists that barely change during a session and that most pages need. Each
     * component fetches its own copy today: measured on production, opening the
     * citizen list requested /user/departments/all/list three times, and the
     * calendar requested five of these lists twice each.
     */
    private static readonly CACHEABLE_PATHS = [
        '/user/departments/all/list',
        '/user/companies/all/list',
        '/user/employees/all/list',
        '/user/citizens/all/list',
        '/user/calendar-tags/all/list',
        '/user/employee-groups',
        '/user/custom-sidebar-links/sidebar/list',
    ]

    // Short on purpose. Long enough to collapse the burst of identical requests
    // during one page load, short enough that a list never looks stale.
    private static readonly CACHE_TTL_MS = 15000

    /**
     * The API tags every request with an id and returns it as X-Request-Id. The
     * same id sits in the server log, so showing it turns "it broke some time
     * this afternoon" into a lookup.
     */
    private static errorIdOf(error: any): string | undefined {
        try {
            return error?.response?.headers?.get?.('x-request-id') ?? undefined
        } catch {
            return undefined
        }
    }

    /**
     * The one 401 body that means "this session is over". The backend's global
     * AuthenticationException handler (bootstrap/app.php) is the only thing that
     * answers with exactly this literal - it is not translated, so matching it is
     * stable across locales. Integration endpoints (Microsoft/Google token
     * refresh, OneDrive, a customer's own OpenAI key) answer 401 with their own
     * body, and those must not end the session: the request failed, the login
     * did not.
     */
    private static readonly UNAUTHENTICATED_MESSAGE = 'Unauthenticated.'

    private static isSessionExpired(data: any): boolean {
        return data?.message === BaseAPIService.UNAUTHENTICATED_MESSAGE
    }

    /**
     * With responseType 'blob' ofetch parses the *error* body as a Blob too, so
     * an error body arrives as bytes rather than as an object. Read it back as
     * JSON so a 401 there can be told apart like any other.
     */
    private static async errorBodyOf(data: any): Promise<any> {
        if (typeof Blob !== 'undefined' && data instanceof Blob) {
            try {
                return JSON.parse(await data.text())
            } catch {
                return {}
            }
        }

        return data ?? {}
    }

    async request(url: string, method: string, params: object = [], signal?: AbortSignal): Promise<any> {
        const key = `${method}:${url}:${JSON.stringify(params)}`

        if (method !== 'GET') {
            // A write makes any cached list for that resource wrong.
            BaseAPIService.invalidateReferenceCache(url)

            const existing = BaseAPIService.inflightRequests.get(key)
            if (existing) return existing
            const promise = this._sendRequest(url, method, params, signal)
                .finally(() => BaseAPIService.inflightRequests.delete(key))
            BaseAPIService.inflightRequests.set(key, promise)
            return promise
        }

        // A cancellable request belongs to one caller (typeahead searches abort
        // the previous one), so it is never shared.
        if (signal) {
            return this._sendRequest(url, method, params, signal)
        }

        const cacheable = BaseAPIService.CACHEABLE_PATHS.some((path) => url.startsWith(path))

        if (cacheable) {
            const cached = BaseAPIService.referenceCache.get(key)
            if (cached && Date.now() - cached.at < BaseAPIService.CACHE_TTL_MS) {
                // A copy, not the stored object: components assign a response
                // into reactive state and then edit it, and two callers sharing
                // one object would edit each other's data.
                return BaseAPIService.copyOf(cached.data)
            }
        }

        // Identical GETs in flight at the same time share one response. This is
        // what removes the duplicate list requests during a page load.
        const existing = BaseAPIService.inflightRequests.get(key)
        if (existing) return existing

        const promise = this._sendRequest(url, method, params, signal)
            .then((data) => {
                if (cacheable) {
                    BaseAPIService.referenceCache.set(key, { at: Date.now(), data })
                }

                return data
            })
            .finally(() => BaseAPIService.inflightRequests.delete(key))

        BaseAPIService.inflightRequests.set(key, promise)

        return promise
    }

    private static copyOf(data: any): any {
        try {
            return typeof structuredClone === 'function' ? structuredClone(data) : JSON.parse(JSON.stringify(data))
        } catch {
            // Anything that will not clone is handed back as it is rather than
            // failing the request.
            return data
        }
    }

    /**
     * Drops cached lists for the resource that was just written to, so adding a
     * department shows up in the next dropdown immediately.
     */
    private static invalidateReferenceCache(url: string): void {
        const resource = url.split('/').slice(0, 3).join('/')

        for (const key of BaseAPIService.referenceCache.keys()) {
            if (key.includes(resource)) {
                BaseAPIService.referenceCache.delete(key)
            }
        }
    }

    /**
     * Posts and reads a server-sent-event response as it arrives.
     *
     * $fetch buffers the whole body, which is the opposite of the point, so this
     * one path uses fetch directly. Rejects with `{ streamUnavailable: true }`
     * only when the endpoint or a proxy in front of it will not stream - a
     * missing route or a server error - which is the caller's signal to fall
     * back to the buffered endpoint. Everything else, a rate limit above all,
     * is a real error: retrying it buffered spends a second request to be
     * refused again, on exactly the request that was already too many.
     */
    async requestStream(
        url: string,
        body: FormData | object,
        onEvent: (event: string, data: any) => void,
        signal?: AbortSignal,
    ): Promise<void> {
        const runtimeConfig = useRuntimeConfig()

        const response = await fetch(`${runtimeConfig.public.apiBaseURL}${url}`, {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('_token'),
                Accept: 'text/event-stream',
            },
            body: body instanceof FormData ? body : JSON.stringify(body),
            signal,
        })

        if (response.status === 401) {
            // Named apart from this method's own `body` parameter.
            const errorBody = await response.json().catch(() => ({}))
            if (BaseAPIService.isSessionExpired(errorBody)) {
                this.revokeAccess()
            }
            throw new APIError({
                ...errorBody,
                status: 401,
                message: errorBody?.message ?? 'Unauthorized',
            })
        }

        if (!response.ok) {
            // 404/405 mean the route is not there; 5xx that it failed on the way
            // out. Both are worth a buffered retry. Other failures are not.
            if ([404, 405].includes(response.status) || response.status >= 500) {
                throw { streamUnavailable: true, status: response.status }
            }

            // Read as text and parse, rather than response.json(). A failed json()
            // was being swallowed into an empty object, which silently dropped every
            // field the error body carried: a 429 arrived with its limit named and
            // reached the panel as a bare status, so a company blocked until
            // tomorrow was told to try again in a minute.
            const raw = await response.text().catch(() => '')
            let body: any = {}
            try {
                body = raw ? JSON.parse(raw) : {}
            } catch {
                body = raw ? { message: raw } : {}
            }

            // Retry-After is only readable when the API exposes it through CORS.
            // The 429 body repeats it as retry_after, which no CORS rule can hide,
            // so that is the reliable source with the header as the fallback.
            const retryAfter =
                Number(body?.retry_after) ||
                Number(response.headers.get('retry-after')) ||
                0

            throw new APIError({
                ...body,
                status: response.status,
                retryAfter,
            })
        }

        if (!response.body) {
            throw { streamUnavailable: true, status: response.status }
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        // Events are separated by a blank line; a chunk can end anywhere, so
        // only whole events are handed on.
        for (;;) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })

            let boundary = buffer.indexOf('\n\n')
            while (boundary !== -1) {
                const raw = buffer.slice(0, boundary)
                buffer = buffer.slice(boundary + 2)
                boundary = buffer.indexOf('\n\n')

                let name = 'message'
                let payload = ''
                for (const line of raw.split('\n')) {
                    if (line.startsWith('event:')) name = line.slice(6).trim()
                    else if (line.startsWith('data:')) payload += line.slice(5).trim()
                }
                if (!payload) continue

                try {
                    onEvent(name, JSON.parse(payload))
                } catch {
                    // A half-written payload is not worth failing the answer for.
                }
            }
        }
    }

    private async _sendRequest(url: string, method: string, params: object, signal?: AbortSignal): Promise<any> {
        const runtimeConfig = useRuntimeConfig()
        let config: any = null
        if (method === 'GET') {
            config = {
                baseURL: runtimeConfig.public.apiBaseURL,
                method: method,
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('_token'),
                    Accept: 'application/json',
                },
                signal,
                params,
            }
        } else {
            config = {
                baseURL: runtimeConfig.public.apiBaseURL,
                method: method,
                headers: {
                    Authorization: 'Bearer ' + localStorage.getItem('_token'),
                    Accept: 'application/json',
                },
                signal,
                body: params,
            }
        }

        try {
            return await $fetch(url, config)
        } catch (error: any) {
            if (error?.name === 'AbortError') throw error
            switch (error.response?.status) {
                case 400:
                    // A 400 here is usually a rule the server is enforcing on
                    // purpose - a required field, a delete that would orphan
                    // something - and that message is written for the user. An
                    // error id appended to it reads as "we crashed, quote this to
                    // support", which is the wrong thing to tell someone who just
                    // forgot a field. The id is kept only when the body says
                    // nothing useful, which is the case it was added for.
                    throw new APIError(
                        error.response._data?.message
                            ? error.response._data
                            : { ...error.response._data, errorId: BaseAPIService.errorIdOf(error) }
                    )
                case 404:
                case 422:
                    throw new APIError(error.response._data)
                case 429:
                    // requestStream's 429 handling attaches these same two fields -
                    // callers like the AI assistant panel branch on error.status to
                    // show a friendly rate-limit message instead of the raw backend
                    // text, and that check needs status/retryAfter present no matter
                    // which of the two request paths produced the error.
                    throw new APIError({
                        ...error.response._data,
                        status: error.response.status,
                        // Body first: Retry-After is only readable when the API
                        // exposes it through CORS, while retry_after in the body
                        // always is.
                        retryAfter:
                            Number(error.response._data?.retry_after) ||
                            Number(error.response?.headers?.get?.('retry-after')) ||
                            0,
                    })
                case 409:
                    // Some 409s carry a business-rule flag alongside the message (e.g.
                    // pouring_empty) that a caller needs to branch on rather than just
                    // showing a generic failure — the real HTTP status makes that
                    // check unambiguous instead of relying on message text.
                    throw new APIError({ ...error.response._data, status: error.response.status })
                case 401:
                    if (BaseAPIService.isSessionExpired(error.response._data)) {
                        this.revokeAccess()
                    }
                    throw new APIError({
                        ...error.response._data,
                        status: 401,
                        message: error.response._data?.message ?? 'Unauthorized',
                    })
                case 403:
                    throw new APIError(error.response._data)
                case 500:
                    throw new APIError({
                        message: "Server error. Please try again. If the problem persists, contact your system administrator",
                        errorId: BaseAPIService.errorIdOf(error),
                    })
                case 503:
                    // Some 503s carry a translated, user-facing message (e.g. the
                    // mileage route-preview endpoint when the routing engine is
                    // unreachable) that must reach the caller as-is, not be
                    // replaced by the generic fallback below.
                    throw new APIError(error.response._data)
                default:
                    throw new APIError({
                        message: "Something went wrong. Please try again. If the problem persists, contact your system administrator",
                        errorId: BaseAPIService.errorIdOf(error),
                    })
            }
        }
    }

    async requestFormData(url: string, formData: FormData): Promise<any> {
        const runtimeConfig = useRuntimeConfig()
        const config = {
            baseURL: runtimeConfig.public.apiBaseURL,
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('_token'),
                Accept: 'application/json',
            },
            body: formData,
        }

        try {
            return await $fetch(url, config)
        } catch (error: any) {
            switch (error.response.status) {
                case 400:
                    // A 400 here is usually a rule the server is enforcing on
                    // purpose - a required field, a delete that would orphan
                    // something - and that message is written for the user. An
                    // error id appended to it reads as "we crashed, quote this to
                    // support", which is the wrong thing to tell someone who just
                    // forgot a field. The id is kept only when the body says
                    // nothing useful, which is the case it was added for.
                    throw new APIError(
                        error.response._data?.message
                            ? error.response._data
                            : { ...error.response._data, errorId: BaseAPIService.errorIdOf(error) }
                    )
                case 404:
                case 409:
                case 422:
                case 429:
                    throw new APIError(error.response._data)
                case 401:
                    if (BaseAPIService.isSessionExpired(error.response._data)) {
                        this.revokeAccess()
                    }
                    throw new APIError({
                        ...error.response._data,
                        status: 401,
                        message: error.response._data?.message ?? 'Unauthorized',
                    })
                case 403:
                    throw new APIError(error.response._data)
                case 500:
                    throw new APIError({
                        message: "Server error. Please try again. If the problem persists, contact your system administrator",
                        errorId: BaseAPIService.errorIdOf(error),
                    })
                default:
                    throw new APIError({
                        message: "Something went wrong. Please try again. If the problem persists, contact your system administrator",
                        errorId: BaseAPIService.errorIdOf(error),
                    })
            }
        }
    }

    async requestBlob(url: string, method: string, params: object = {}): Promise<Blob | null> {
        const runtimeConfig = useRuntimeConfig()
        const config: any = {
            baseURL: runtimeConfig.public.apiBaseURL,
            method,
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('_token'),
                Accept: 'application/json',
            },
            responseType: 'blob' as const,
        }

        if (method === 'GET') {
            config.params = params
        } else {
            config.body = params
        }

        try {
            return await $fetch(url, config) as Blob
        } catch (error: any) {
            switch (error.response.status) {
                case 400:
                    // A 400 here is usually a rule the server is enforcing on
                    // purpose - a required field, a delete that would orphan
                    // something - and that message is written for the user. An
                    // error id appended to it reads as "we crashed, quote this to
                    // support", which is the wrong thing to tell someone who just
                    // forgot a field. The id is kept only when the body says
                    // nothing useful, which is the case it was added for.
                    throw new APIError(
                        error.response._data?.message
                            ? error.response._data
                            : { ...error.response._data, errorId: BaseAPIService.errorIdOf(error) }
                    )
                case 404:
                case 409:
                case 422:
                case 429:
                    throw new APIError(error.response._data)
                case 401: {
                    // Not error.response._data directly: this call asked for a blob,
                    // so ofetch handed the error body back as one too.
                    const errorBody = await BaseAPIService.errorBodyOf(error.response._data)
                    if (BaseAPIService.isSessionExpired(errorBody)) {
                        this.revokeAccess()
                    }
                    throw new APIError({
                        ...errorBody,
                        status: 401,
                        message: errorBody?.message ?? 'Unauthorized',
                    })
                }
                case 403:
                    throw new APIError(error.response._data)
                case 500:
                    throw new APIError({
                        message: "Server error. Please try again. If the problem persists, contact your system administrator",
                        errorId: BaseAPIService.errorIdOf(error),
                    })
                default:
                    throw new APIError({
                        message: "Something went wrong. Please try again. If the problem persists, contact your system administrator",
                        errorId: BaseAPIService.errorIdOf(error),
                    })
            }
        }
    }

    revokeAccess() {
        clearSessionToken()
        localStorage.removeItem("rememberMe")
        // If this 401 happened mid-impersonation (e.g. the backend revoked all of
        // the impersonated user's tokens), don't leave _original_token stranded -
        // it would make the impersonation banner show for whoever logs in next
        // on this browser, impersonated or not.
        localStorage.removeItem("_original_token")

        // A page fires several requests in parallel (sidebar counts, lists, the
        // page's own data), so an expired session 401s several times at once.
        // Only the first arrival should navigate: by the time the rest run,
        // window.location already points at "/" (with ?redirect= attached) from
        // that first navigateTo, so once we're already there the rest must be
        // no-ops — re-navigating to a bare "/" would wipe the redirect the
        // first call just set.
        if (typeof window === 'undefined') return
        if (window.location.pathname === '/') return

        navigateTo({ path: '/', query: { redirect: window.location.pathname } })
    }
}

export default BaseAPIService
