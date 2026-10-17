import BaseAPIService from '@/components/api/BaseAPIService'

class SuperadminNpsService extends BaseAPIService {
    async overview(): Promise<any> {
        return await this.request('/superadmin/nps', 'GET')
    }
}

export const superadminNpsService = new SuperadminNpsService()
