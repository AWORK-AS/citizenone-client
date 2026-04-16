import BaseAPIService from '@/components/api/BaseAPIService'

class PermissionService extends BaseAPIService {
    async getAllPermissions(params?: object): Promise<any> {
        return await this.request(`/user/permissions/all/list`, 'GET', params)
    }
}

export const permissionService = new PermissionService()