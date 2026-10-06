import BaseAPIService from '@/components/api/BaseAPIService'

class AuthService extends BaseAPIService {
    async login(params: object): Promise<any> {
        return await this.request(`/auth/login`, 'POST', params)
    }
    
    // Microsoft single sign-on, through the company's own Entra tenant.
    async microsoftSso(email: string): Promise<any> {
        return await this.request(`/auth/sso/microsoft`, 'GET', { email })
    }

    // The one-time code the SSO callback hands back, for a login token.
    async ssoExchange(code: string): Promise<any> {
        return await this.request(`/auth/sso/exchange`, 'POST', { code })
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

    async verifyResetPassword(token: string): Promise<any> {
        return await this.request(`/auth/verify-token`, 'POST', { token })
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

    async verifyIpOtp(params: object): Promise<any> {
        return await this.request(`/auth/verify-ip-otp`, 'POST', params)
    }

    async verifyDeviceOtp(params: object): Promise<any> {
        return await this.request(`/auth/verify-device-otp`, 'POST', params)
    }
}
export const authService = new AuthService()