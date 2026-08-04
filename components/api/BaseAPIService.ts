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
                        message: "Server error. Please try again. If the problem persists, contact your system administrator"
                    })
                default:
                    throw new APIError({
                        message: "Something went wrong. Please try again. If the problem persists, contact your system administrator"
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
                        message: "Server error. Please try again. If the problem persists, contact your system administrator"
                    })
                default:
                    throw new APIError({
                        message: "Something went wrong. Please try again. If the problem persists, contact your system administrator"
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
                        message: "Server error. Please try again. If the problem persists, contact your system administrator"
                    })
                default:
                    throw new APIError({
                        message: "Something went wrong. Please try again. If the problem persists, contact your system administrator"
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
