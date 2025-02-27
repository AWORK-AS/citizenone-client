import BaseAPIService from '@/components/api/user/BaseAPIService'

class CustomPagesService extends BaseAPIService {
    async getCustomPages(params: object): Promise<any> {
        return await this.request(`/user/custom-pages`, 'GET', params)
    }

    async getCustomPage(customPageUuid: any): Promise<any> {
        return await this.request(`/user/custom-pages/${customPageUuid}`, 'GET')
    }

    async saveCustomPage(params: object): Promise<any> {
        return await this.request(`/user/custom-pages`, 'POST', params)
    }

    async updateCustomPage(customPageUuid: any, params: object): Promise<any> {
        return await this.request(`/user/custom-pages/${customPageUuid}`, 'PUT', params)
    }

    async deleteCustomPage(customPageUuid: any): Promise<any> {
        return await this.request(`/user/custom-pages/${customPageUuid}`, 'DELETE')
    }
}

export const customPagesService = new CustomPagesService()