import BaseAPIService from '@/components/api/BaseAPIService'

class AuthService extends BaseAPIService {
    async login(params: object): Promise<any> {
        return await this.request(`/auth/login`, 'POST', params)
    }

    async verify2faCode(params: object): Promise<any> {
        return await this.request(`/auth/2fa/verify/code`, 'POST', params)
    }

    async register(params: object): Promise<any> {
        return await this.request(`/auth/register`, 'POST', params)
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

    async setPassword(params: object): Promise<any> {
        return await this.request(`/auth/set-password`, 'POST', params)
    }

    async verifyEmail(token: any): Promise<any> {
        return await this.request(`/auth/verify-email/${token}`, 'POST')
    }
}

export const authService = new AuthService()