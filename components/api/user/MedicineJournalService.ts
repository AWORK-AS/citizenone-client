import BaseAPIService from '@/components/api/BaseAPIService'

class MedicineJournalService extends BaseAPIService {
    async getMedicines(params: object): Promise<any> {
        return await this.request(`/user/citizen-medicines`, 'GET', params)
    }

    async getMedicine(medicineUuid: any): Promise<any> {
        return await this.request(`/user/citizen-medicines/${medicineUuid}`, 'GET')
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

    async activateDeactivateMedicine(medicineUuid: any): Promise<any> {
        return await this.request(`/user/citizen-medicines/${medicineUuid}/activate-deactivate `, 'PUT')
    }

    async getAllSelectedMedicines(params: object): Promise<any> {
        return await this.request(`/user/citizen-medicines/multiple/list`, 'GET', params)
    }

    async downloadMedicine(medicineUuid: any): Promise<any> {
        return await this.request(`/user/citizen-medicines/${medicineUuid}/download`, 'GET')
    }

    async downloadMedicineOverview(params: object): Promise<any> {
        return await this.request(`/user/citizen-medicines/download/overview`, 'GET', params)
    }
}

export const medicineJournalService = new MedicineJournalService()