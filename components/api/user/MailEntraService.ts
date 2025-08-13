import BaseAPIService from '@/components/api/BaseAPIService'

class MailEntraService extends BaseAPIService {
    async getMails(params: object): Promise<any> {
        return await this.request(`/user/entra/fetch/emails`, 'GET', params)
    }
}
export const mailEntraService = new MailEntraService()