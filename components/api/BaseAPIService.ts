import APIError from '@/components/api/user/APIError'

class BaseAPIService {
    async request(url: string, method: string, params: object = [], signal?: AbortSignal): Promise<any> {
        const runtimeConfig = useRuntimeConfig()
        let config: any = null
        if (method === 'GET') {
            // GET
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
            // POST, PUT, DELETE
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
                    throw new APIError(error.response._data)
                case 404:
                case 422:
                    throw new APIError(error.response._data)
                case 429:
                    throw new APIError(error.response._data)
                case 401:
                    this.revokeAccess()
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
                    throw new APIError(error.response._data)
                case 404:
                case 422:
                    throw new APIError(error.response._data)
                case 429:
                    throw new APIError(error.response._data)
                case 401:
                    this.revokeAccess()
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
                    throw new APIError(error.response._data)
                case 404:
                case 422:
                    throw new APIError(error.response._data)
                case 429:
                    throw new APIError(error.response._data)
                case 401:
                    this.revokeAccess()
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
        localStorage.removeItem("remember_me")
        navigateTo('/')
    }
}

export default BaseAPIService