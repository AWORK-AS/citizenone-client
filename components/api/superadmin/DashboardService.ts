import BaseAPIService from '@/components/api/BaseAPIService'

class DashboardService extends BaseAPIService {
    async getDashboardData(params: object): Promise<any> {
        return await this.request(`/superadmin/dashboard`, 'GET', params)
    }

    /**
     * Ledelsesfanens tal. Egen rute, fordi den ligger bag `view_management` -
     * felterne lå før på dashboardet og var dermed hentbare af hele holdet.
     */
    async getManagementOverview(params: object): Promise<any> {
        return await this.request(`/superadmin/management/overview`, 'GET', params)
    }

    async getCompanyStorage(params: object): Promise<any> {
        return await this.request(`/superadmin/dashboard/company/storage`, 'GET', params)
    }
}

export const dashboardService = new DashboardService()