import BaseAPIService from '@/components/api/BaseAPIService'

class CitizenEmployeeGroupService extends BaseAPIService {
    async getAssignedGroups(citizenUuid: any): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/employee-groups`, 'GET')
    }

    async assignGroups(citizenUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/employee-groups`, 'POST', params)
    }

    async unassignGroup(citizenUuid: any, groupUuid: any): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/employee-groups/${groupUuid}`, 'DELETE')
    }
}

export const citizenEmployeeGroupService = new CitizenEmployeeGroupService()
