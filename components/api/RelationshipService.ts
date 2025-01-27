import BaseAPIService from '@/components/api/BaseAPIService'

class RelationshipService extends BaseAPIService {
    async getRelationships(params: object): Promise<any> {
        return await this.request(`/user/relationships`, 'GET', params)
    }

    async getRelationship(relationshipUuid: any): Promise<any> {
        return await this.request(`/user/relationships/${relationshipUuid}`, 'GET')
    }

    async saveRelationship(params: object): Promise<any> {
        return await this.request(`/user/relationships`, 'POST', params)
    }

    async updateRelationship(relationshipUuid: any, params: object): Promise<any> {
        return await this.request(`/user/relationships/${relationshipUuid}`, 'PUT', params)
    }

    async deleteRelationship(relationshipUuid: any): Promise<any> {
        return await this.request(`/user/relationships/${relationshipUuid}`, 'DELETE')
    }

    async getAllRelationships(): Promise<any> {
        return await this.request(`/user/relationships/all/list`, 'GET')
    }
}

export const relationshipService = new RelationshipService()