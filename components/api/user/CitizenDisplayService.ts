import BaseAPIService from '@/components/api/BaseAPIService'

class CitizenDisplayService extends BaseAPIService {
    async getAllCitizenDisplay(): Promise<any> {
        return await this.request(`/user/citizen-displays/all/list`, 'GET')
    }

    // Which roles may see each field on the citizen card.
    async getRoles(): Promise<any> {
        return await this.request(`/user/citizen-displays/roles`, 'GET')
    }

    async updateRoles(fields: Array<{ uuid: string, role_ids: number[] }>): Promise<any> {
        return await this.request(`/user/citizen-displays/roles`, 'PUT', { fields })
    }
}

export const citizenDisplayService = new CitizenDisplayService()