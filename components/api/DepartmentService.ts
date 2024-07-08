import BaseAPIService from '@/components/api/BaseAPIService'

class DepartmentService extends BaseAPIService {
    async getAllDepartment(): Promise<any> {
        return await this.request(`/user/departments/all/list`, 'GET')
    }
}

export const departmentService = new DepartmentService()