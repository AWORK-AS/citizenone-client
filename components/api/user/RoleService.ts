import BaseAPIService from '@/components/api/BaseAPIService'

class RoleService extends BaseAPIService {
    async getRoles(params: object): Promise<any> {
        return await this.request(`/user/roles`, 'GET', params)
    }

    async getRole(roleId: any): Promise<any> {
        return await this.request(`/user/roles/${roleId}`, 'GET')
    }

    async saveRole(params: object): Promise<any> {
        return await this.request(`/user/roles`, 'POST', params)
    }

    async updateRole(roleId: any, params: object): Promise<any> {
        return await this.request(`/user/roles/${roleId}`, 'PUT', params)
    }

    async deleteRole(roleId: any): Promise<any> {
        return await this.request(`/user/roles/${roleId}`, 'DELETE')
    }

    async getAllRoles(): Promise<any> {
        return await this.request(`/user/roles/all/list`, 'GET')
    }
}

export const roleService = new RoleService()