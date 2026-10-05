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

    // Stageless fields, asked for at creation - before an inquiry exists yet.
    // With a form, also the fields that belong to that form alone.
    async getFieldsForCreation(params: { form_uuid?: string | null } = {}): Promise<any> {
        return await this.request(`/user/inquiry-field-definitions/for-creation`, 'GET', params.form_uuid ? { form_uuid: params.form_uuid } : undefined)
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
