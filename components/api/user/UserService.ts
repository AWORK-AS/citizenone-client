import BaseAPIService from '@/components/api/BaseAPIService'

class UserService extends BaseAPIService {
    async logout(): Promise<any> {
        return await this.request(`/auth/logout`, 'POST')
    }

    async getUser(): Promise<any> {
        return await this.request(`/user`, 'GET')
    }

    async checkin(params: object): Promise<any> {
        return await this.request(`/user/time-logs/time/in`, 'POST', params)
    }

    async checkout(params: object): Promise<any> {
        return await this.request(`/user/time-logs/time/out`, 'PUT', params)
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

    async importEmployees(params: object): Promise<any> {
        return await this.request(`/user/employees/imports/template`, 'POST', params)
    }

    async getAllUsersWithoutAllUsersOption(): Promise<any> {
        return await this.request(`/user/employees/all/no-all-employees`, 'GET')
    }

    async getAllUsersWithoutMyself(params: object): Promise<any> {
        return await this.request(`/user/my-calendars/employee/list`, 'GET', params)
    }

    async switchCompany(params: object): Promise<any> {
        return await this.request(`/user/switch-company`, 'PUT', params)
    }

    async updateSelectedDepartment(params: object): Promise<any> {
        return await this.request(`/user/change-selected-department`, 'PUT', params)
    }

    async updateFirstLoginToFalse(): Promise<any> {
        return await this.request(`user/update/first-login`, 'PUT')
    }

    async uploadCompanyLogo(params: FormData): Promise<any> {
        return await this.request(`/user/company/settings/company/upload-logo`, 'POST', params)
    }

    async readNews(): Promise<any> {
        return await this.request(`/user/update/read-news`, 'PUT')
    }

    async readUpdates(): Promise<any> {
        return await this.request(`/user/update/read-updates`, 'PUT')
    }

    async deleteCompanyLogo(): Promise<any> {
        return await this.request(`/user/company/settings/company/delete-logo`, 'DELETE')
    }
}

export const userService = new UserService()