import BaseAPIService from '@/components/api/BaseAPIService'

// Partner domains the company has forced TLS with: secure mail to them needs no password.
class TrustedMailDomainService extends BaseAPIService {
    async getAll(): Promise<any> {
        return await this.request(`/user/trusted-mail-domains`, 'GET')
    }

    async create(params: object): Promise<any> {
        return await this.request(`/user/trusted-mail-domains`, 'POST', params)
    }

    async delete(uuid: string): Promise<any> {
        return await this.request(`/user/trusted-mail-domains/${uuid}`, 'DELETE')
    }
}

export const trustedMailDomainService = new TrustedMailDomainService()
