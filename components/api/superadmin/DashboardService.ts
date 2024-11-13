import BaseAPIService from '@/components/api/BaseAPIService'

class DashboardService extends BaseAPIService {
    async getDashboardData(): Promise<any> {
        return await this.request(`/superadmin/dashboard`, 'GET')
    }
}

export const dashboardService = new DashboardService()