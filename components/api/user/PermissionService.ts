import BaseAPIService from '@/components/api/BaseAPIService'

class PermissionService extends BaseAPIService {
    async getAllPermissions(): Promise<any> {
        return await this.request(`/user/permissions/all/list`, 'GET')
    }
}

export const permissionService = new PermissionService()