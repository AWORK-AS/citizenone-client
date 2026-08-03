import APIError from '@/components/api/user/APIError'

class BaseAPIService {
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

    private readonly inflightRequests = new Map<string, Promise<any>>()

    async request(url: string, method: string, params: object = [], signal?: AbortSignal): Promise<any> {
        if (method !== 'GET') {
            const key = `${method}:${url}:${JSON.stringify(params)}`
            const existing = this.inflightRequests.get(key)
            if (existing) return existing
            const promise = this._sendRequest(url, method, params, signal)
                .finally(() => this.inflightRequests.delete(key))
            this.inflightRequests.set(key, promise)
            return promise
        }
        return this._sendRequest(url, method, params, signal)
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
