import BaseAPIService from '@/components/api/BaseAPIService'

class EmployeeService extends BaseAPIService {
    async getEmployees(params: object): Promise<any> {
        return await this.request(`/user/employees`, 'GET', params)
    }

    async getEmployee(employeeUuid: any): Promise<any> {
        return await this.request(`/user/employees/${employeeUuid}`, 'GET')
    }

    async saveEmployee(params: object): Promise<any> {
        return await this.request(`/user/employees`, 'POST', params)
    }

    async updateEmployee(employeeUuid: any, params: object): Promise<any> {
        return await this.request(`/user/employees/${employeeUuid}/update`, 'POST', params)
    }

    async deleteEmployee(employeeUuid: any): Promise<any> {
        return await this.request(`/user/employees/${employeeUuid}`, 'DELETE')
    }
}

export const employeeService = new EmployeeService()