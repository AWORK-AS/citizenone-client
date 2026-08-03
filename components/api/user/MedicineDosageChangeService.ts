import BaseAPIService from '@/components/api/BaseAPIService'

class MedicineDosageChangeService extends BaseAPIService {
    async getDosageChanges(citizenMedicineUuid: any, params: object = {}): Promise<any> {
        return await this.request(`/user/citizen-medicines/${citizenMedicineUuid}/dosage-changes`, 'GET', params)
    }

    async saveDosageChange(citizenMedicineUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizen-medicines/${citizenMedicineUuid}/dosage-changes`, 'POST', params)
    }

    async deleteDosageChange(citizenMedicineUuid: any, dosageChangeUuid: any): Promise<any> {
        return await this.request(`/user/citizen-medicines/${citizenMedicineUuid}/dosage-changes/${dosageChangeUuid}`, 'DELETE')
    }
}

export const medicineDosageChangeService = new MedicineDosageChangeService()
