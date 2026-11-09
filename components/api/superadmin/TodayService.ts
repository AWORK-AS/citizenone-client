import BaseAPIService from '@/components/api/BaseAPIService'

class TodayService extends BaseAPIService {
    async getToday(): Promise<any> {
        return await this.request(`/superadmin/today`, 'GET')
    }
}

export const superadminTodayService = new TodayService()
