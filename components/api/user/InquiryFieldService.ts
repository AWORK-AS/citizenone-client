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
    // With a service type, also the fields tied to that type.
    async getFieldsForCreation(params: { form_uuid?: string | null, service_type_uuid?: string | null } = {}): Promise<any> {
        const query: Record<string, string> = {}
        if (params.form_uuid) query.form_uuid = params.form_uuid
        if (params.service_type_uuid) query.service_type_uuid = params.service_type_uuid

        return await this.request(`/user/inquiry-field-definitions/for-creation`, 'GET', Object.keys(query).length ? query : undefined)
    }

    async saveFields(inquiryUuid: string, answers: Record<string, any>): Promise<any> {
        return await this.request(`/user/citizen-inquiries/${inquiryUuid}/fields`, 'PUT', { answers })
    }

    // The fields carried over to an indsats, kept on the citizen.
    async getCitizenFields(citizenUuid: string): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/field-values`, 'GET')
    }

    async saveCitizenFields(citizenUuid: string, answers: Record<string, any>): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/field-values`, 'PUT', { answers })
    }

    // Which stage the inquiry is in, what comes next, and what is stopping it -
    // read from the same gate that refuses the move.
    async getStageGate(inquiryUuid: string): Promise<any> {
        return await this.request(`/user/citizen-inquiries/${inquiryUuid}/stage-gate`, 'GET')
    }
}

export const inquiryFieldService = new InquiryFieldService()
