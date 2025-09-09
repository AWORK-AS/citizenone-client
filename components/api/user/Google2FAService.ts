import BaseAPIService from '@/components/api/BaseAPIService'

class Google2FAService extends BaseAPIService {
    async generateQR(): Promise<any> {
        return await this.request(`/user/2fa/generate-google-qr-2fa`, 'GET')
    }

    async verifyCode(params: object): Promise<any> {
        return await this.request(`/user/2fa/toggle/google`, 'POST', params)
    }
}

export const google2FAService = new Google2FAService()