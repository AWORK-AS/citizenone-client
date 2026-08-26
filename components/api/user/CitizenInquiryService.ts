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

    async updatePipelineStatus(inquiryUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizen-inquiries/${inquiryUuid}/pipeline-status`, 'PUT', params)
    }

    async deleteInquiry(inquiryUuid: any): Promise<any> {
        return await this.request(`/user/citizen-inquiries/${inquiryUuid}`, 'DELETE')
    }

    async convertInquiry(inquiryUuid: any): Promise<any> {
        return await this.request(`/user/citizen-inquiries/${inquiryUuid}/convert-inquiry`, 'POST')
    }

    // Won cases that were converted but nobody has been put on yet.
    async getUnassignedConverted(): Promise<any> {
        return await this.request(`/user/citizen-inquiries/unassigned/converted`, 'GET')
    }

    async assignSelf(inquiryUuids: string[]): Promise<any> {
        return await this.request(`/user/citizen-inquiries/assign/self`, 'POST', { inquiry_uuids: inquiryUuids })
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

    // Export inquiries
    async exportInquiries(params: object): Promise<any> {
        return await this.request(`/user/citizen-inquiries/export/download`, 'GET', params)
    }
}

export const citizenInquiryService = new CitizenInquiryService()