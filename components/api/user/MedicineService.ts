import BaseAPIService from '@/components/api/BaseAPIService'

class MedicineService extends BaseAPIService {
    async getMedicines(params: object): Promise<any> {
        return await this.request(`/user/medicines`, 'GET', params)
    }

    async getMedicine(medicineUuid: any): Promise<any> {
        return await this.request(`/user/medicines/${medicineUuid}`, 'GET')
    }

    async saveMedicine(params: object): Promise<any> {
        return await this.request(`/user/medicines`, 'POST', params)
    }

    async updateMedicine(medicineUuid: any, params: object): Promise<any> {
        return await this.request(`/user/medicines/${medicineUuid}`, 'PUT', params)
    }

    async deleteMedicine(medicineUuid: any): Promise<any> {
        return await this.request(`/user/medicines/${medicineUuid}`, 'DELETE')
    }

    async getAllMedicines(): Promise<any> {
        return await this.request(`/user/medicines/all/list`, 'GET')
    }
}

export const medicineService = new MedicineService()