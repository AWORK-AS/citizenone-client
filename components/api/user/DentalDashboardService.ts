import BaseAPIService from '@/components/api/BaseAPIService'

class DentalDashboardService extends BaseAPIService {
    async getDashboard(): Promise<any> {
        return await this.request(`/user/dental-dashboard`, 'GET')
    }
}

export const dentalDashboardService = new DentalDashboardService()
