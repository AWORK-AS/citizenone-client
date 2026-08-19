import BaseAPIService from '@/components/api/BaseAPIService'

class AnalyticsService extends BaseAPIService {
    // Business trends over a date range, grouped by day, week, month, quarter
    // or year. Revenue and MRR are only returned to superadmins with
    // view_financials.
    async getTrends(params: any): Promise<any> {
        return await this.request(`/superadmin/analytics/trends`, 'GET', params)
    }
}

export const analyticsService = new AnalyticsService()
