import BaseAPIService from '@/components/api/BaseAPIService'

/**
 * The company header on every superadmin company page, and the company's
 * history. Both need view_companies; the money inside them is left out by the
 * API without view_financials.
 */
class CompanyHistoryService extends BaseAPIService {
    async getSummary(companyUuid: string): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}/summary`, 'GET')
    }

    /** `before` is the previous page's `meta.next_before`; `types` a comma list. */
    async getTimeline(companyUuid: string, params: { before?: string; types?: string } = {}): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}/timeline`, 'GET', params)
    }
}

export const companyHistoryService = new CompanyHistoryService()
