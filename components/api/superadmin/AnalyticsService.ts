import BaseAPIService from '@/components/api/BaseAPIService'

class AnalyticsService extends BaseAPIService {
    // Business trends over a date range, grouped by day, week, month, quarter
    // or year. Revenue and MRR are only returned to superadmins with
    // view_financials.
    async getTrends(params: any): Promise<any> {
        return await this.request(`/superadmin/analytics/trends`, 'GET', params)
    }

    // What today's agreements are scheduled to bill, month by month, N years
    // ahead. Money, so view_financials only.
    async getRevenueForecast(years: number): Promise<any> {
        return await this.request(`/superadmin/analytics/revenue-forecast`, 'GET', { years })
    }

    /**
     * Kunderne bag én måneds søjle i prognosen. `month` er 'YYYY-MM'.
     */
    async getRenewals(month: string): Promise<any> {
        return await this.request(`/superadmin/analytics/revenue-forecast/${month}/renewals`, 'GET')
    }
}

export const analyticsService = new AnalyticsService()
