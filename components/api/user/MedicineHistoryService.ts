import BaseAPIService from '@/components/api/BaseAPIService'

class MedicineHistoryService extends BaseAPIService {
    async getMedicineHistories(params: object): Promise<any> {
        return await this.request(`/user/citizen-medicine-histories`, 'GET', params)
    }

    async getMedicineHistoryByMedicineUuid(medicineUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizen-medicine-histories/${medicineUuid}/give-medicine`, 'GET', params)
    }

    async saveMedicineHistory(params: object): Promise<any> {
        return await this.request(`/user/citizen-medicine-histories`, 'POST', params)
    }

    async updateMedicineHistory(medicineHistoryUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizen-medicine-histories/${medicineHistoryUuid}`, 'PUT', params)
    }

    async deleteMedicineHistory(medicineHistoryUuid: any): Promise<any> {
        return await this.request(`/user/citizen-medicine-histories/${medicineHistoryUuid}`, 'DELETE')
    }
}

export const medicineHistoryService = new MedicineHistoryService()