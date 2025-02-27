import BaseAPIService from '@/components/api/user/BaseAPIService'

class MedicineJournalService extends BaseAPIService {
    async getMedicines(params: object): Promise<any> {
        return await this.request(`/user/citizen-medicines`, 'GET', params)
    }

    async saveMedicine(params: object): Promise<any> {
        return await this.request(`/user/citizen-medicines`, 'POST', params)
    }

    async updateMedicine(medicineUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizen-medicines/${medicineUuid}/update`, 'POST', params)
    }

    async deleteMedicine(medicineUuid: any): Promise<any> {
        return await this.request(`/user/citizen-medicines/${medicineUuid}`, 'DELETE')
    }
}

export const medicineJournalService = new MedicineJournalService()