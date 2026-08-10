import APIError from '@/components/api/user/APIError'

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
            this.revokeAccess()
            throw new APIError({ message: 'Unauthorized' })
        }

        if (!response.ok) {
            // 404/405 mean the route is not there; 5xx that it failed on the way
            // out. Both are worth a buffered retry. Other failures are not.
            if ([404, 405].includes(response.status) || response.status >= 500) {
                throw { streamUnavailable: true, status: response.status }
            }

            const body = await response.json().catch(() => ({}))
            throw new APIError({
                ...body,
                status: response.status,
                retryAfter: Number(response.headers.get('retry-after')) || 0,
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
                    // This app answers 400 with a generic message for server-side
                    // failures it caught itself, so the id belongs here too.
                    throw new APIError({ ...error.response._data, errorId: BaseAPIService.errorIdOf(error) })
                case 404:
                case 422:
                case 429:
                    throw new APIError(error.response._data)
                case 401:
                    this.revokeAccess()
                    throw new APIError(error.response._data || { message: 'Unauthorized' })
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
                    // This app answers 400 with a generic message for server-side
                    // failures it caught itself, so the id belongs here too.
                    throw new APIError({ ...error.response._data, errorId: BaseAPIService.errorIdOf(error) })
                case 404:
                case 422:
                case 429:
                    throw new APIError(error.response._data)
                case 401:
                    this.revokeAccess()
                    throw new APIError(error.response._data || { message: 'Unauthorized' })
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
                    // This app answers 400 with a generic message for server-side
                    // failures it caught itself, so the id belongs here too.
                    throw new APIError({ ...error.response._data, errorId: BaseAPIService.errorIdOf(error) })
                case 404:
                case 422:
                case 429:
                    throw new APIError(error.response._data)
                case 401:
                    this.revokeAccess()
                    throw new APIError(error.response._data || { message: 'Unauthorized' })
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
        localStorage.removeItem("_token")
        localStorage.removeItem("rememberMe")
        navigateTo('/')
    }
}

export default BaseAPIService
