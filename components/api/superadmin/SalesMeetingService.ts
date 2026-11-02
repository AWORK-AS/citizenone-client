import BaseAPIService from '@/components/api/BaseAPIService'

/** Online meetings our team holds with prospects (sales inquiries) and customers (accounts). */
class SalesMeetingService extends BaseAPIService {
    async hosts(): Promise<any> {
        return await this.request('/superadmin/sales-meetings/hosts', 'GET')
    }

    async inquiryMeetings(inquiryUuid: string): Promise<any> {
        return await this.request(`/superadmin/sales-inquiries/${inquiryUuid}/meetings`, 'GET')
    }

    async scheduleForInquiry(inquiryUuid: string, params: object): Promise<any> {
        return await this.request(`/superadmin/sales-inquiries/${inquiryUuid}/meetings`, 'POST', params)
    }

    async companyMeetings(companyUuid: string): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}/meetings`, 'GET')
    }

    async scheduleForCompany(companyUuid: string, params: object): Promise<any> {
        return await this.request(`/superadmin/companies/${companyUuid}/meetings`, 'POST', params)
    }
}

export const salesMeetingService = new SalesMeetingService()
