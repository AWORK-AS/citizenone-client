import BaseAPIService from '@/components/api/BaseAPIService'

class PortalAccessService extends BaseAPIService {
    async getOverview(): Promise<any> {
        return await this.request(`/user/portal-access/overview`, 'GET')
    }
}

export const portalAccessService = new PortalAccessService()
