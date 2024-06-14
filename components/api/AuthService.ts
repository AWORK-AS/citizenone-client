import BaseAPIService from '@/components/api/BaseAPIService'

class AuthService extends BaseAPIService {
    async login(params: object): Promise<any> {
        return await this.request(`/auth/login`, 'POST', params)
    }

    async logout(): Promise<any> {
        return await this.request(`/auth/logout`, 'POST')
    }

    async forgotPassword(params: object): Promise<any> {
        return await this.request(`/auth/forgot-password`, 'POST', params)
    }

    async verifyResetPassword(token: any): Promise<any> {
        return await this.request(`/auth/verify-token/${token}`, 'POST')
    }

    async resetPassword(params: object): Promise<any> {
        return await this.request(`/auth/reset-password`, 'POST', params)
    }
}

export const authService = new AuthService()