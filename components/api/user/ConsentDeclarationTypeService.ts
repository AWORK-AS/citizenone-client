import BaseAPIService from '@/components/api/BaseAPIService'

class ConsentDeclarationTypeService extends BaseAPIService {
    async getConsentDeclarationTypes(params: object): Promise<any> {
        return await this.request(`/user/consent-declaration-types`, 'GET', params)
    }

    async getConsentDeclarationType(uuid: any): Promise<any> {
        return await this.request(`/user/consent-declaration-types/${uuid}`, 'GET')
    }

    async saveConsentDeclarationType(params: object): Promise<any> {
        return await this.request(`/user/consent-declaration-types`, 'POST', params)
    }

    async updateConsentDeclarationType(uuid: any, params: object): Promise<any> {
        return await this.request(`/user/consent-declaration-types/${uuid}`, 'PUT', params)
    }

    async deleteConsentDeclarationType(uuid: any): Promise<any> {
        return await this.request(`/user/consent-declaration-types/${uuid}`, 'DELETE')
    }

    async getAllConsentDeclarationTypes(): Promise<any> {
        return await this.request(`/user/consent-declaration-types/all/list`, 'GET')
    }
}

export const consentDeclarationTypeService = new ConsentDeclarationTypeService()
