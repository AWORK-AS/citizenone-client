import BaseAPIService from '@/components/api/BaseAPIService'

class MedicinePouringService extends BaseAPIService {
    async createPouring(citizenMedicineUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizen-medicines/${citizenMedicineUuid}/pourings`, 'POST', params)
    }
}

export const medicinePouringService = new MedicinePouringService()
