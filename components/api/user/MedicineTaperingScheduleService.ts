import BaseAPIService from '@/components/api/BaseAPIService'

class MedicineTaperingScheduleService extends BaseAPIService {
    async getTaperingSchedules(citizenMedicineUuid: any, params: object = {}): Promise<any> {
        return await this.request(`/user/citizen-medicines/${citizenMedicineUuid}/tapering-schedules`, 'GET', params)
    }

    async saveTaperingSchedule(citizenMedicineUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizen-medicines/${citizenMedicineUuid}/tapering-schedules`, 'POST', params)
    }

    async deleteTaperingSchedule(citizenMedicineUuid: any, scheduleUuid: any): Promise<any> {
        return await this.request(`/user/citizen-medicines/${citizenMedicineUuid}/tapering-schedules/${scheduleUuid}`, 'DELETE')
    }

    async deleteTaperingScheduleStep(citizenMedicineUuid: any, scheduleUuid: any, stepUuid: any): Promise<any> {
        return await this.request(`/user/citizen-medicines/${citizenMedicineUuid}/tapering-schedules/${scheduleUuid}/steps/${stepUuid}`, 'DELETE')
    }
}

export const medicineTaperingScheduleService = new MedicineTaperingScheduleService()
