import BaseAPIService from '@/components/api/BaseAPIService'

class MedicinePouringService extends BaseAPIService {
    async createPouring(citizenMedicineUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizen-medicines/${citizenMedicineUuid}/pourings`, 'POST', params)
    }

    async getPourings(citizenMedicineUuid: any): Promise<any> {
        return await this.request(`/user/citizen-medicines/${citizenMedicineUuid}/pourings`, 'GET')
    }
}

export const medicinePouringService = new MedicinePouringService()
