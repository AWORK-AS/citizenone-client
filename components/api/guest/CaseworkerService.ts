import APIError from '@/components/api/user/APIError'

class CaseworkerService {
    private getHeaders(includeAuth = true) {
        const headers: Record<string, string> = {
            Accept: 'application/json',
        }

        if (includeAuth) {
            const token = localStorage.getItem('_token')
            if (token) {
                headers.Authorization = `Bearer ${token}`
            }
        }

        return headers
    }

    private async request(url: string, method: string, params: object = [], includeAuth = true): Promise<any> {
        const runtimeConfig = useRuntimeConfig()
        const config: any = {
            baseURL: runtimeConfig.public.apiBaseURL,
            method,
            headers: this.getHeaders(includeAuth),
        }

        if (method === 'GET') {
            config.onRequest = ({ options }: { options: any }) => {
                options.params = params
            }
        } else {
            config.body = params
        }

        try {
            return await $fetch(url, config)
        } catch (error: any) {
            if (error?.name === 'AbortError') throw error

            switch (error.response?.status) {
                case 400:
                case 401:
                case 404:
                case 422:
                case 429:
                    throw new APIError(error.response._data)
                case 500:
                    throw new APIError({
                        message: 'Server error. Please try again. If the problem persists, contact your system administrator',
                    })
                default:
                    throw new APIError({
                        message: 'Something went wrong. Please try again. If the problem persists, contact your system administrator',
                    })
            }
        }
    }

    private async requestBlob(url: string, method: string, params: object = {}, includeAuth = true): Promise<Blob> {
        const runtimeConfig = useRuntimeConfig()
        const config: any = {
            baseURL: runtimeConfig.public.apiBaseURL,
            method,
            headers: this.getHeaders(includeAuth),
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
            if (error?.name === 'AbortError') throw error

            switch (error.response?.status) {
                case 400:
                case 401:
                case 404:
                case 422:
                case 429:
                    throw new APIError(error.response._data)
                case 500:
                    throw new APIError({
                        message: 'Server error. Please try again. If the problem persists, contact your system administrator',
                    })
                default:
                    throw new APIError({
                        message: 'Something went wrong. Please try again. If the problem persists, contact your system administrator',
                    })
            }
        }
    }

    async authenticateCaseworker(uuid: string, params: object): Promise<any> {
        return await this.request(`/guest/caseworker/${uuid}/auth`, 'POST', params, false)
    }

    async verifyCaseworker(uuid: string): Promise<any> {
        return await this.request(`/guest/caseworker/${uuid}/verify`, 'GET')
    }

    async getDashboard(uuid: string): Promise<any> {
        return await this.request(`/guest/caseworker/${uuid}/dashboard`, 'GET')
    }

    async getFolders(uuid: string): Promise<any> {
        return await this.request(`/guest/caseworker/${uuid}/folders`, 'GET')
    }

    async getFolderContents(uuid: string, folderId: string): Promise<any> {
        return await this.request(`/guest/caseworker/${uuid}/folder/${folderId}`, 'GET')
    }

    async getReports(uuid: string): Promise<any> {
        return await this.request(`/guest/caseworker/${uuid}/reports`, 'GET')
    }

    async getMessages(uuid: string): Promise<any> {
        return await this.request(`/guest/caseworker/${uuid}/messages`, 'GET')
    }

    async sendMessage(uuid: string, params: object): Promise<any> {
        return await this.request(`/guest/caseworker/${uuid}/messages`, 'POST', params)
    }

    async downloadFile(uuid: string, fileUuid: string): Promise<Blob> {
        return await this.requestBlob(`/guest/caseworker/${uuid}/download/${fileUuid}`, 'GET')
    }

    async logout(uuid: string): Promise<any> {
        return await this.request(`/guest/caseworker/${uuid}/logout`, 'POST')
    }
}

export const caseworkerService = new CaseworkerService()