import BaseAPIService from '@/components/api/BaseAPIService'

class InquiryPartyService extends BaseAPIService {
    async getParties(inquiryUuid: string): Promise<any> {
        return await this.request(`/user/citizen-inquiries/${inquiryUuid}/parties`, 'GET')
    }

    async saveParty(inquiryUuid: string, params: object): Promise<any> {
        return await this.request(`/user/citizen-inquiries/${inquiryUuid}/parties`, 'POST', params)
    }

    async updateParty(partyUuid: string, params: object): Promise<any> {
        return await this.request(`/user/inquiry-parties/${partyUuid}`, 'PUT', params)
    }

    async deleteParty(partyUuid: string): Promise<any> {
        return await this.request(`/user/inquiry-parties/${partyUuid}`, 'DELETE')
    }
}

export const inquiryPartyService = new InquiryPartyService()
