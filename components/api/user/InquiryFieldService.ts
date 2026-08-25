import BaseAPIService from '@/components/api/BaseAPIService'

class InquiryFieldService extends BaseAPIService {
    async getDefinitions(params: object = {}): Promise<any> {
        return await this.request(`/user/inquiry-field-definitions/all/list`, 'GET', params)
    }

    async saveDefinition(params: object): Promise<any> {
        return await this.request(`/user/inquiry-field-definitions`, 'POST', params)
    }

    async updateDefinition(fieldUuid: string, params: object): Promise<any> {
        return await this.request(`/user/inquiry-field-definitions/${fieldUuid}`, 'PUT', params)
    }

    async deleteDefinition(fieldUuid: string): Promise<any> {
        return await this.request(`/user/inquiry-field-definitions/${fieldUuid}`, 'DELETE')
    }

    async reorderDefinitions(uuids: string[]): Promise<any> {
        return await this.request(`/user/inquiry-field-definitions/reorder`, 'PUT', { uuids })
    }

    // The fields of one inquiry, each carrying that inquiry's answer.
    async getFields(inquiryUuid: string): Promise<any> {
        return await this.request(`/user/citizen-inquiries/${inquiryUuid}/fields`, 'GET')
    }

    async saveFields(inquiryUuid: string, answers: Record<string, any>): Promise<any> {
        return await this.request(`/user/citizen-inquiries/${inquiryUuid}/fields`, 'PUT', { answers })
    }

    // Which stage the inquiry is in, what comes next, and what is stopping it -
    // read from the same gate that refuses the move.
    async getStageGate(inquiryUuid: string): Promise<any> {
        return await this.request(`/user/citizen-inquiries/${inquiryUuid}/stage-gate`, 'GET')
    }
}

export const inquiryFieldService = new InquiryFieldService()
