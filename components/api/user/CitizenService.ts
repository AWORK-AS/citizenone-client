import BaseAPIService from '@/components/api/BaseAPIService'

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

    async getAllCitizens(params: object): Promise<any> {
        return await this.request(`/user/citizens/all/list`, 'GET', params)
    }

    async getAllCitizensPerUserDepartment(params: object): Promise<any> {
        return await this.request(`/user/citizens/all/user/departments`, 'GET', params)
    }

    async getAllAssignedCitizens(params: object): Promise<any> {
        return await this.request(`/user/citizens/all/user/assigned`, 'GET', params)
    }

    async getAllAssignee(params: object): Promise<any> {
        return await this.request(`user/citizens/all/assignee/list`, 'GET', params)
    }

    async removeAssignedCitizen(params: object): Promise<any> {
        return await this.request(`/user/citizens/all/user/assigned/remove`, 'DELETE', params)
    }

    async getAllAvailableCitizens(params: object): Promise<any> {
        return await this.request(`/user/citizens/all/available-citizens`, 'GET', params)
    }

    async deleteCitizenCalendarEvent(scheduleUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizen-calendars/${scheduleUuid}`, 'DELETE', params)
    }

    async importCitizens(params: object): Promise<any> {
        return await this.request(`/user/citizens/imports/template`, 'POST', params)
    }

    async downloadImportCitizensTemplate(): Promise<any> {
        return await this.request(`/user/citizens/imports/download/template`, 'GET')
    }
}

export const citizenService = new CitizenService()