import BaseAPIService from '@/components/api/BaseAPIService'

class DosageFormService extends BaseAPIService {
    async getDosageForms(params: object): Promise<any> {
        return await this.request(`/user/dosage-forms`, 'GET', params)
    }

    async getDosageForm(dosageFormUuid: any): Promise<any> {
        return await this.request(`/user/dosage-forms/${dosageFormUuid}`, 'GET')
    }

    async saveDosageForm(params: object): Promise<any> {
        return await this.request(`/user/dosage-forms`, 'POST', params)
    }

    async updateDosageForm(dosageFormUuid: any, params: object): Promise<any> {
        return await this.request(`/user/dosage-forms/${dosageFormUuid}`, 'PUT', params)
    }

    async deleteDosageForm(dosageFormUuid: any): Promise<any> {
        return await this.request(`/user/dosage-forms/${dosageFormUuid}`, 'DELETE')
    }

    async getAllDosageForms(params: object): Promise<any> {
        return await this.request(`/user/dosage-forms/all/list`, 'GET', params)
    }
}

export const dosageFormService = new DosageFormService()