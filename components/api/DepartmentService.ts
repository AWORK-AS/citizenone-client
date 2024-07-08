import BaseAPIService from '@/components/api/BaseAPIService'

class DepartmentService extends BaseAPIService {
    async getDepartments(params: object): Promise<any> {
        return await this.request(`/user/departments`, 'GET', params)
    }

    async getDepartment(departmentUuid: any): Promise<any> {
        return await this.request(`/user/departments/${departmentUuid}`, 'GET')
    }

    async saveDepartment(params: object): Promise<any> {
        return await this.request(`/user/departments`, 'POST', params)
    }

    async updateDepartment(departmentUuid: any, params: object): Promise<any> {
        return await this.request(`/user/departments/${departmentUuid}`, 'PUT', params)
    }

    async getAllDepartments(): Promise<any> {
        return await this.request(`/user/departments/all/list`, 'GET')
    }
}

export const departmentService = new DepartmentService()