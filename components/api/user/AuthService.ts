import BaseAPIService from '@/components/api/BaseAPIService'

class AuthService extends BaseAPIService {
    async login(params: object): Promise<any> {
        return await this.request(`/auth/login`, 'POST', params)
    }
    
    async microsoftLogin(): Promise<any> {
        return await this.request(`/auth/ad/login`, 'GET')
    }
    async googleLogin(): Promise<any> {
        return await this.request(`/auth/google/login`, 'GET')
    }
    async verify2faCode(params: object): Promise<any> {
        return await this.request(`/auth/2fa/verify/code`, 'POST', params)
    }

    async register(params: object): Promise<any> {
        return await this.request(`/auth/register`, 'POST', params)
    }

    async registerInvitation(params: object): Promise<any> {
        return await this.request(`/auth/register-invitation`, 'POST', params)
    }

    async logout(): Promise<any> {
        return await this.request(`/auth/logout`, 'POST')
    }

    async forgotPassword(params: object): Promise<any> {
        return await this.request(`/auth/forgot-password`, 'POST', params)
    }

    async verifyResetPassword(params: object): Promise<any> {
        return await this.request(`/auth/verify-token`, 'POST', params)
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
    async ssoRedirect(email: string): Promise<any> {
        return await this.request(`/auth/sso/redirect`, 'POST', { email })
    }
}
export const authService = new AuthService()