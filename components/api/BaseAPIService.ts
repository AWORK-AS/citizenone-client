import APIError from '@/components/api/user/APIError'

class BaseAPIService {
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
                async onRequest({ request, options }: { request: any, options: any }) {
                    options.params = params
                },
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
