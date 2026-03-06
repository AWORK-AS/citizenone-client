import BaseAPIService from '@/components/api/BaseAPIService';

class TimeAccountTemplateAgreementService extends BaseAPIService {
    async getTemplateAgreements(params: any): Promise<any> {
        return await this.request(`/user/time-account-agreement-templates`, 'GET', params);
    }

    async getTemplateAgreement(uuid: any): Promise<any> {
        return await this.request(`/user/time-account-agreement-templates/${uuid}`, 'GET');
    }

    async saveTemplateAgreement(params: any): Promise<any> {
        return await this.request(`/user/time-account-agreement-templates`, 'POST', params);
    }

    async updateTemplateAgreement(uuid: any, params: any): Promise<any> {
        return await this.request(`/user/time-account-agreement-templates/${uuid}`, 'PUT', params);
    }

    async deleteTemplateAgreement(uuid: any): Promise<any> {
        return await this.request(`/user/time-account-agreement-templates/${uuid}`, 'DELETE');
    }

    async assignTemplateAgreement(uuid: any, params: any): Promise<any> {
        return await this.request(`/user/time-account-agreement-templates/${uuid}/assign-targets`, 'POST', params);
    }

    async unassignTemplateAgreement(uuid: any, params: any): Promise<any> {
        return await this.request(`/user/time-account-agreement-templates/${uuid}/unassign-targets`, 'POST', params);
    }
}

export const timeAccountTemplateAgreementService = new TimeAccountTemplateAgreementService();
