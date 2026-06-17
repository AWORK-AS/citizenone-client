import BaseAPIService from '@/components/api/BaseAPIService'

class CitizenProtocolService extends BaseAPIService {
    async getCitizenProtocols(params: object): Promise<any> {
        return await this.request(`/user/citizen-protocols`, 'GET', params)
    }

    async updateCitizenProtocol(citizenProtocolUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizen-protocols/${citizenProtocolUuid}`, 'PUT', params)
    }

    async deleteCitizenProtocol(citizenProtocolUuid: any): Promise<any> {
        return await this.request(`/user/citizen-protocols/${citizenProtocolUuid}`, 'DELETE')
    }

    async downloadCitizenProtocol(citizenProtocolUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizen-protocols/${citizenProtocolUuid}/download`, 'GET', params)
    }

    // Attendance — check-in/out
    async checkInCitizen(citizenProtocolUuid: string, params: object = {}): Promise<any> {
        return await this.request(`/user/citizen-protocols/${citizenProtocolUuid}`, 'PUT', params)
    }

    async checkOutCitizen(citizenProtocolUuid: string, params: object = {}): Promise<any> {
        return await this.request(`/user/citizen-protocols/${citizenProtocolUuid}`, 'PUT', params)
    }

    // Attendance — reports
    async getWeeklyAttendanceReport(params: object): Promise<any> {
        return await this.request(`/user/attendance-reports/weekly`, 'GET', params)
    }

    async getMonthlyAttendanceReport(params: object): Promise<any> {
        return await this.request(`/user/attendance-reports/monthly`, 'GET', params)
    }
}

export const citizenProtocolService = new CitizenProtocolService()