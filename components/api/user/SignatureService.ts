import BaseAPIService from '@/components/api/BaseAPIService'

class SignatureService extends BaseAPIService {
    async getSignatures(params: object): Promise<any> {
        return await this.request(`/user/mail-signatures`, 'GET', params)
    }

    async getSignature(signatureUuid: any): Promise<any> {
        return await this.request(`/user/mail-signatures/${signatureUuid}`, 'GET')
    }

    async saveSignature(params: object): Promise<any> {
        return await this.request(`/user/mail-signatures`, 'POST', params)
    }

    async updateSignature(signatureUuid: any, params: object): Promise<any> {
        return await this.request(`/user/mail-signatures/${signatureUuid}`, 'PUT', params)
    }

    async deleteSignature(signatureUuid: any): Promise<any> {
        return await this.request(`/user/mail-signatures/${signatureUuid}`, 'DELETE')
    }

    async setSignatureToDefault(signatureUuid: any): Promise<any> {
        return await this.request(`/user/mail-signatures/${signatureUuid}/set-default`, 'PUT')
    }
    async getAllSignatures(): Promise<any> {
        return await this.request(`/user/mail-signatures/all/list`, 'GET')
    }
}

export const signatureService = new SignatureService()