import BaseAPIService from '@/components/api/BaseAPIService'

class EmployeeGroupService extends BaseAPIService {
    async getEmployeeGroups(params: object): Promise<any> {
        return await this.request(`/user/employee-groups`, 'GET', params)
    }

    async getEmployeeGroup(employeeGroupUuid: any): Promise<any> {
        return await this.request(`/user/employee-groups/${employeeGroupUuid}`, 'GET')
    }

    async saveEmployeeGroup(params: object): Promise<any> {
        return await this.request(`/user/employee-groups`, 'POST', params)
    }

    async updateEmployeeGroup(employeeGroupUuid: any, params: object): Promise<any> {
        return await this.request(`/user/employee-groups/${employeeGroupUuid}`, 'PUT', params)
    }

    async deleteEmployeeGroup(employeeGroupUuid: any): Promise<any> {
        return await this.request(`/user/employee-groups/${employeeGroupUuid}`, 'DELETE')
    }
}

export const employeeGroupService = new EmployeeGroupService()