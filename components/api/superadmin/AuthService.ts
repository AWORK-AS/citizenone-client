import BaseAPIService from '@/components/api/BaseAPIService'

class AuthService extends BaseAPIService {
    async login(params: object): Promise<any> {
        return await this.request(`/auth/superadmin/login`, 'POST', params)
    }

    // Second step when the login answered with a challenge (staff with 2FA on).
    async verifyTwoFactor(params: { challenge: string; code: string }): Promise<any> {
        return await this.request(`/auth/superadmin/2fa/verify`, 'POST', params)
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
}

export const authService = new AuthService()