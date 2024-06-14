import BaseAPIService from '@/components/api/BaseAPIService'

class UserService extends BaseAPIService {
    async logout(): Promise<any> {
        return await this.request(`/auth/logout`, 'POST')
    }
}

export const userService = new UserService()