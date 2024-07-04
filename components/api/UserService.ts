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

    async updateCompany(params: object): Promise<any> {
        return await this.request(`/user/company/update/details`, 'PUT', params)
    }

    async getAllUsers(): Promise<any> {
        return await this.request(`/user/employees/all/list`, 'GET')
    }
}

export const userService = new UserService()