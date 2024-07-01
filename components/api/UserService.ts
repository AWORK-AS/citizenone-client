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
}

export const userService = new UserService()