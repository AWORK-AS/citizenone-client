import BaseAPIService from '@/components/api/BaseAPIService'

class CitizenRelationService extends BaseAPIService {
    async getRelations(params: object): Promise<any> {
        return await this.request(`/user/citizen-relations`, 'GET', params)
    }

    async saveRelation(params: object): Promise<any> {
        return await this.request(`/user/citizen-relations`, 'POST', params)
    }

    async deleteRelation(relationUuid: string): Promise<any> {
        return await this.request(`/user/citizen-relations/${relationUuid}`, 'DELETE')
    }
}

export const citizenRelationService = new CitizenRelationService()
