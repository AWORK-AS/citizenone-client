import BaseAPIService from '@/components/api/BaseAPIService'

class EmployerAuthService extends BaseAPIService {
    async login(params: object): Promise<any> {
        return await this.request(`/auth/employer/login`, 'POST', params)
    }

    async logout(): Promise<any> {
        return await this.request(`/auth/employer/logout`, 'POST')
    }

    async forgotPassword(params: object): Promise<any> {
        return await this.request(`/auth/employer/forgot-password`, 'POST', params)
    }

    async resetPassword(params: object): Promise<any> {
        return await this.request(`/auth/employer/reset-password`, 'POST', params)
    }

    async verifyToken(token: string): Promise<any> {
        return await this.request(`/auth/employer/verify-token/${token}`, 'POST')
    }
}

export const employerAuthService = new EmployerAuthService()
