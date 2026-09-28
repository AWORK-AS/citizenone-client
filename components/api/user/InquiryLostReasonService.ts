import BaseAPIService from '@/components/api/BaseAPIService'

class InquiryLostReasonService extends BaseAPIService {
    async getReasons(): Promise<any> {
        return await this.request(`/user/inquiry-lost-reasons/all/list`, 'GET')
    }

    async saveReason(params: object): Promise<any> {
        return await this.request(`/user/inquiry-lost-reasons`, 'POST', params)
    }

    async updateReason(reasonUuid: string, params: object): Promise<any> {
        return await this.request(`/user/inquiry-lost-reasons/${reasonUuid}`, 'PUT', params)
    }

    async deleteReason(reasonUuid: string): Promise<any> {
        return await this.request(`/user/inquiry-lost-reasons/${reasonUuid}`, 'DELETE')
    }

    async reorderReasons(uuids: string[]): Promise<any> {
        return await this.request(`/user/inquiry-lost-reasons/reorder`, 'PUT', { uuids })
    }
}

export const inquiryLostReasonService = new InquiryLostReasonService()
