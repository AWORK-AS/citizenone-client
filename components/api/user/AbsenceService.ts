import BaseAPIService from '@/components/api/user/BaseAPIService'

class AbsenceService extends BaseAPIService {
    async getAbsences(params: object): Promise<any> {
        return await this.request(`/user/absences`, 'GET', params)
    }

    async getAbsence(absenceUuid: any): Promise<any> {
        return await this.request(`/user/absences/${absenceUuid}`, 'GET')
    }

    async saveAbsence(params: object): Promise<any> {
        return await this.request(`/user/absences`, 'POST', params)
    }

    async updateAbsence(absenceUuid: any, params: object): Promise<any> {
        return await this.request(`/user/absences/${absenceUuid}`, 'PUT', params)
    }

    async getAllAbsences(): Promise<any> {
        return await this.request(`/user/absences/all/list`, 'GET')
    }
}

export const absenceService = new AbsenceService()