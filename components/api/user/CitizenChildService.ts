import BaseAPIService from '@/components/api/BaseAPIService'

class CitizenChildService extends BaseAPIService {
    async getCitizenChildren(params: object): Promise<any> {
        return await this.request(`/user/citizen-children`, 'GET', params)
    }

    async getCitizenChild(citizenChildrenUuid: any): Promise<any> {
        return await this.request(`/user/citizen-children/${citizenChildrenUuid}`, 'GET')
    }

    async saveCitizenChild(params: object): Promise<any> {
        return await this.request(`/user/citizen-children`, 'POST', params)
    }

    async updateCitizenChild(citizenChildrenUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizen-children/${citizenChildrenUuid}`, 'PUT', params)
    }

    async deleteCitizenChild(citizenChildrenUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizen-children/${citizenChildrenUuid}`, 'DELETE')
    }
}

export const citizenChildService = new CitizenChildService()