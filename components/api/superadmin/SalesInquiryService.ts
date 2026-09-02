import BaseAPIService from '@/components/api/BaseAPIService'

class SalesInquiryService extends BaseAPIService {
    async getInquiries(params: object): Promise<any> {
        return await this.request('/superadmin/sales-inquiries', 'GET', params)
    }

    async getInquiry(uuid: string): Promise<any> {
        return await this.request(`/superadmin/sales-inquiries/${uuid}`, 'GET')
    }

    async updateInquiry(uuid: string, params: object): Promise<any> {
        return await this.request(`/superadmin/sales-inquiries/${uuid}`, 'PUT', params)
    }

    async addNote(uuid: string, params: object): Promise<any> {
        return await this.request(`/superadmin/sales-inquiries/${uuid}/notes`, 'POST', params)
    }

    async getStatusSettings(): Promise<any> {
        return await this.request('/superadmin/sales-inquiry-statuses', 'GET')
    }

    async saveStatusSettings(params: object): Promise<any> {
        return await this.request('/superadmin/sales-inquiry-statuses', 'PUT', params)
    }
}

export const salesInquiryService = new SalesInquiryService()
