import BaseAPIService from '@/components/api/BaseAPIService'

class EmployeeService extends BaseAPIService {
    async getEmployees(params: object): Promise<any> {
        return await this.request(`/user/employees`, 'GET', params)
    }

    async getEmployee(employeeId: number): Promise<any> {
        return await this.request(`/user/employees/${employeeId}`, 'GET')
    }

    async saveEmployee(params: object): Promise<any> {
        return await this.request(`/user/employees`, 'POST', params)
    }

    async updateEmployee(employeeUuid: any, params: object): Promise<any> {
        return await this.request(`/user/employees/${employeeUuid}`, 'PUT', params)
    }
}

export const employeeService = new EmployeeService()