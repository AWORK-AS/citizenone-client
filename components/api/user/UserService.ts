import BaseAPIService from '@/components/api/BaseAPIService'

class UserService extends BaseAPIService {
    async logout(): Promise<any> {
        return await this.request(`/auth/logout`, 'POST')
    }

    async getUser(): Promise<any> {
        return await this.request(`/user`, 'GET')
    }

    async checkin(): Promise<any> {
        return await this.request(`/user/time-logs/time/in`, 'POST')
    }

    async checkout(): Promise<any> {
        return await this.request(`/user/time-logs/time/out`, 'PUT')
    }

    async updateUser(params: object): Promise<any> {
        return await this.request(`/user/update`, 'POST', params)
    }

    async updateUserLangugage(params: object): Promise<any> {
        return await this.request(`/user/employees/update/language`, 'PUT', params)
    }

    async updateCompany(params: object): Promise<any> {
        return await this.request(`/user/company/update/details`, 'PUT', params)
    }

    async getAllUsers(params: object): Promise<any> {
        return await this.request(`/user/employees/all/list`, 'GET', params)
    }

    async getAllUsersWithoutAllUsersOption(): Promise<any> {
        return await this.request(`/user/employees/all/no-all-employees`, 'GET')
    }

    async getAllUsersWithoutMyself(): Promise<any> {
        return await this.request(`/user/my-calendars/employee/list`, 'GET')
    }

    async switchCompany(params: object): Promise<any> {
        return await this.request(`/user/switch-company`, 'PUT', params)
    }

    async updateSelectedDepartment(params: object): Promise<any> {
        return await this.request(`/user/change-selected-department`, 'PUT', params)
    }

    async uploadCompanyLogo(params: FormData): Promise<any> {
        return await this.request(`user/company/settings/company/upload-logo`, 'POST', params)
    }
}

export const userService = new UserService()