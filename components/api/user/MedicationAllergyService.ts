import BaseAPIService from '@/components/api/BaseAPIService'

class MedicationAllergyService extends BaseAPIService {
    async getMedicationAllergies(params: object): Promise<any> {
        return await this.request(`/user/medication-allergy`, 'GET', params)
    }

    async getMedicationAllergy(medicationAllergyUuid: any): Promise<any> {
        return await this.request(`/user/medication-allergy/${medicationAllergyUuid}`, 'GET')
    }

    async saveMedicationAllergy(params: object): Promise<any> {
        return await this.request(`/user/medication-allergy`, 'POST', params)
    }

    async updateMedicationAllergy(medicationAllergyUuid: any, params: object): Promise<any> {
        return await this.request(`/user/medication-allergy/${medicationAllergyUuid}`, 'PUT', params)
    }

    async deleteMedicationAllergy(medicationAllergyUuid: any): Promise<any> {
        return await this.request(`/user/medication-allergy/${medicationAllergyUuid}`, 'DELETE')
    }

    async getAllMedicationAllergies(): Promise<any> {
        return await this.request(`/user/medication-allergy/all/list`, 'GET')
    }
}

export const medicationAllergyService = new MedicationAllergyService()