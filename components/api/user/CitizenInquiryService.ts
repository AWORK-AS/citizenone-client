import BaseAPIService from '@/components/api/BaseAPIService'

class CitizenInquiryService extends BaseAPIService {
    async getInquiries(params: object): Promise<any> {
        return await this.request(`/user/citizen-inquiries`, 'GET', params)
    }

    async getSelectedInquiry(inquiryUuid: any): Promise<any> {
        return await this.request(`/user/citizen-inquiries/${inquiryUuid}`, 'GET')
    }

    async saveInquiry(params: object): Promise<any> {
        return await this.request(`/user/citizen-inquiries`, 'POST', params)
    }

    async updateInquiry(inquiryUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizen-inquiries/${inquiryUuid}`, 'PUT', params)
    }

    async deleteInquiry(inquiryUuid: any): Promise<any> {
        return await this.request(`/user/citizen-inquiries/${inquiryUuid}`, 'DELETE')
    }

    async convertInquiry(inquiryUuid: any): Promise<any> {
        return await this.request(`/user/citizen-inquiries/${inquiryUuid}/convert-inquiry`, 'POST')
    }
}

export const citizenInquiryService = new CitizenInquiryService()