import BaseAPIService from '@/components/api/BaseAPIService'

// Checks the Admin may view the system as the role, and logs that they do.
class RolePreviewService extends BaseAPIService {
    async start(roleId: number): Promise<any> {
        return await this.request(`/user/role-preview/start`, 'POST', { role_id: roleId })
    }
}

export const rolePreviewService = new RolePreviewService()
