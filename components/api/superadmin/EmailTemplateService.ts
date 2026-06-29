import BaseAPIService from '@/components/api/BaseAPIService'

class EmailTemplateService extends BaseAPIService {
    async getEmailTemplates(): Promise<any> {
        return await this.request(`/superadmin/email-templates`, 'GET')
    }

    async getEmailTemplate(uuid: any): Promise<any> {
        return await this.request(`/superadmin/email-templates/${uuid}`, 'GET')
    }

    async updateEmailTemplate(uuid: any, params: object): Promise<any> {
        return await this.request(`/superadmin/email-templates/${uuid}`, 'PUT', params)
    }
}

export const emailTemplateService = new EmailTemplateService()
