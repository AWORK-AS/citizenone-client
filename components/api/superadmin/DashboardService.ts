import BaseAPIService from '@/components/api/BaseAPIService'

class DashboardService extends BaseAPIService {
    async getDashboardData(params: object): Promise<any> {
        return await this.request(`/superadmin/dashboard`, 'GET', params)
    }

    async getCompanyStorage(params: object): Promise<any> {
        return await this.request(`/superadmin/dashboard/company/storage`, 'GET', params)
    }
}

export const dashboardService = new DashboardService()