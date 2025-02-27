import BaseAPIService from '@/components/api/user/BaseAPIService'

class CitizenService extends BaseAPIService {
    async getCitizens(params: object): Promise<any> {
        return await this.request(`/user/citizens`, 'GET', params)
    }

    async getCitizen(citizenUuid: any): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}`, 'GET')
    }

    async getCitizenCalendar(params: object): Promise<any> {
        return await this.request(`/user/citizen-calendars`, 'GET', params)
    }

    async saveCitizen(params: object): Promise<any> {
        return await this.request(`/user/citizens`, 'POST', params)
    }

    async updateCitizen(citizenUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/update`, 'POST', params)
    }

    async archiveUnarchiveCitizen(citizenUuid: any): Promise<any> {
        return await this.request(`/user/citizens/${citizenUuid}/archive`, 'PUT')
    }

    async getArchivedCitizens(params: object): Promise<any> {
        return await this.request(`/user/citizens/archived/list`, 'GET', params)
    }

    async getAllCitizens(): Promise<any> {
        return await this.request(`/user/citizens/all/list`, 'GET')
    }

    async getAllAvailableCitizens(params: object): Promise<any> {
        return await this.request(`/user/citizens/all/available-citizens`, 'GET', params)
    }

    async deleteCitizenCalendarEvent(scheduleUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizen-calendars/${scheduleUuid}`, 'DELETE', params)
    }
}

export const citizenService = new CitizenService()