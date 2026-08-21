import BaseAPIService from '@/components/api/BaseAPIService'

class MedicinePlannedDeliveryService extends BaseAPIService {
    async createPlannedDelivery(citizenMedicineUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizen-medicines/${citizenMedicineUuid}/planned-deliveries`, 'POST', params)
    }
}

export const medicinePlannedDeliveryService = new MedicinePlannedDeliveryService()
