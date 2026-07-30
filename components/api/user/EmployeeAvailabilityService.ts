import BaseAPIService from '@/components/api/BaseAPIService'

class EmployeeAvailabilityService extends BaseAPIService {
    async getMine(params: object): Promise<any> {
        return await this.request(`/user/employee-availabilities`, 'GET', params)
    }

    async getForCompany(params: object): Promise<any> {
        return await this.request(`/user/employee-availabilities/company`, 'GET', params)
    }

    async saveAvailability(params: object): Promise<any> {
        return await this.request(`/user/employee-availabilities`, 'POST', params)
    }

    async deleteAvailability(uuid: any): Promise<any> {
        return await this.request(`/user/employee-availabilities/${uuid}`, 'DELETE')
    }
}

export const employeeAvailabilityService = new EmployeeAvailabilityService()
