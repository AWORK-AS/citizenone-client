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

    async deleteUser(userUuid: any): Promise<any> {
        return await this.request(`/superadmin/users/${userUuid}`, 'DELETE')
    }

    // Own 2FA setup (QR + manual key), then the first code turns it on.
    async getTwoFactorSetup(): Promise<any> {
        return await this.request(`/superadmin/2fa/setup`, 'GET')
    }

    async confirmTwoFactor(params: { code: string }): Promise<any> {
        return await this.request(`/superadmin/2fa/confirm`, 'POST', params)
    }

    // A colleague who lost their phone; needs manage_team, never oneself.
    async resetTwoFactor(userUuid: any): Promise<any> {
        return await this.request(`/superadmin/users/${userUuid}/reset-2fa`, 'POST')
    }

    async getCurrentUser(): Promise<any> {
        return await this.request(`/superadmin`, 'GET')
    }
}

export const userService = new UserService()