import BaseAPIService from '@/components/api/BaseAPIService'

class RoleService extends BaseAPIService {
    async getRoles(params: object): Promise<any> {
        return await this.request(`/user/roles`, 'GET', params)
    }

    async getRole(roleUuid: any): Promise<any> {
        return await this.request(`/user/roles/${roleUuid}`, 'GET')
    }

    async saveRole(params: object): Promise<any> {
        return await this.request(`/user/roles`, 'POST', params)
    }

    async updateRole(roleUuid: any, params: object): Promise<any> {
        return await this.request(`/user/roles/${roleUuid}`, 'PUT', params)
    }

    async deleteRole(roleUuid: any): Promise<any> {
        return await this.request(`/user/roles/${roleUuid}`, 'DELETE')
    }

    async getAllRoles(): Promise<any> {
        return await this.request(`/user/roles/all/list`, 'GET')
    }
}

export const roleService = new RoleService()