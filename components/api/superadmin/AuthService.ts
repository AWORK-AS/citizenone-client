import BaseAPIService from '@/components/api/BaseAPIService'

class AuthService extends BaseAPIService {
    async login(params: object): Promise<any> {
        return await this.request(`/auth/superadmin/login`, 'POST', params)
    }

    async logout(): Promise<any> {
        return await this.request(`/auth/logout`, 'POST')
    }

    async verifyResetPassword(token: any): Promise<any> {
        return await this.request(`/auth/verify-token/${token}`, 'POST')
    }

    async setPassword(params: object): Promise<any> {
        return await this.request(`/auth/set-password`, 'POST', params)
    }
}

export const authService = new AuthService()