import BaseAPIService from '@/components/api/BaseAPIService'

class CitizenDoctorService extends BaseAPIService {
    async getAllCitizenDoctors(citizenUuid: any): Promise<any> {
        return await this.request(`/user/citizen-contacts/${citizenUuid}/doctor/list`, 'GET')
    }
}

export const citizenDoctorService = new CitizenDoctorService()