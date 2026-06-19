import BaseAPIService from '@/components/api/BaseAPIService'

class ReportTemplateService extends BaseAPIService {
    async getReportTemplates(params: object): Promise<any> {
        return await this.request(`/user/report-templates`, 'GET', params)
    }

    async getAllReportTemplates(params: object): Promise<any> {
        return await this.request(`/user/report-templates/all/list`, 'GET', params)
    }

    async getReportTemplate(uuid: any): Promise<any> {
        return await this.request(`/user/report-templates/${uuid}`, 'GET')
    }

    async saveReportTemplate(params: object): Promise<any> {
        return await this.request(`/user/report-templates`, 'POST', params)
    }

    async updateReportTemplate(uuid: any, params: object): Promise<any> {
        return await this.request(`/user/report-templates/${uuid}`, 'PUT', params)
    }

    async deleteReportTemplate(uuid: any): Promise<any> {
        return await this.request(`/user/report-templates/${uuid}`, 'DELETE')
    }
}

export const reportTemplateService = new ReportTemplateService()
