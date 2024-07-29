import BaseAPIService from '@/components/api/BaseAPIService'

class UserService extends BaseAPIService {
    async getUsers(params: object): Promise<any> {
        return await this.request(`/superadmin/users`, 'GET', params)
    }

    async getUser(userUuid: any): Promise<any> {
        return await this.request(`/superadmin/users/${userUuid}`, 'GET')
    }

    async saveUser(params: object): Promise<any> {
        return await this.request(`/superadmin/users`, 'POST', params)
    }

    async updateUser(userUuid: any, params: object): Promise<any> {
        return await this.request(`/superadmin/users/${userUuid}`, 'PUT', params)
    }

    async getCurrentUser(): Promise<any> {
        return await this.request(`/superadmin`, 'GET')
    }
}

export const userService = new UserService()