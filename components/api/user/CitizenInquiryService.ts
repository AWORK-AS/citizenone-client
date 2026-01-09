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

    // Crisis Center inquiry specific endpoints
    async getAboutList(): Promise<any> {
        return await this.request(`/user/inquiry-topics/all/list`, 'GET')
    }

    async getAssessmentReasonList(): Promise<any> {
        return await this.request(`/user/inquiry-no-assessment-reasons/all/list`, 'GET')
    }

    async getGuidanceList(): Promise<any> {
        return await this.request(`/user/inquiry-guidances/all/list`, 'GET')
    }
}

export const citizenInquiryService = new CitizenInquiryService()