import BaseAPIService from '@/components/api/BaseAPIService'

class TeamRoleService extends BaseAPIService {
    async getRoles(): Promise<any> {
        return await this.request('/superadmin/team-roles', 'GET')
    }

    /**
     * De rettigheder en rolle kan bygges af, med danske navne fra backenden.
     */
    async getPermissions(): Promise<any> {
        return await this.request('/superadmin/team-permissions', 'GET')
    }

    async saveRole(params: object): Promise<any> {
        return await this.request('/superadmin/team-roles', 'POST', params)
    }

    async updateRole(id: number, params: object): Promise<any> {
        return await this.request(`/superadmin/team-roles/${id}`, 'PUT', params)
    }

    async deleteRole(id: number): Promise<any> {
        return await this.request(`/superadmin/team-roles/${id}`, 'DELETE')
    }
}

export const teamRoleService = new TeamRoleService()
