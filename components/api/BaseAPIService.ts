import APIError from '@/components/api/user/APIError'

class BaseAPIService {
    async request(url: string, method: string, params: object = []): Promise<any> {
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
                body: params,
            }
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
                        message: "Vi har registreret denne fejl. Du behøver ikke at gøre noget. Vi vender tilbage til dig hurtigst muligt."
                    })
                default:
                    throw new APIError({
                        message: "Vi har registreret denne fejl. Du behøver ikke at gøre noget. Vi vender tilbage til dig hurtigst muligt."
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