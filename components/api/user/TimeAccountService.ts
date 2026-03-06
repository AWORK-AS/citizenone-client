import BaseAPIService from '@/components/api/BaseAPIService';

class TimeAccountService extends BaseAPIService {
    async getTimeAccounts(params: any): Promise<any> {
        return await this.request(`/user/time-accounts`, 'GET', params);
    }

    async getTimeAccount(timeAccountUuid: any): Promise<any> {
        return await this.request(`/user/time-accounts/${timeAccountUuid}`, 'GET');
    }

    async saveTimeAccount(params: any): Promise<any> {
        return await this.request(`/user/time-accounts`, 'POST', params);
    }

    async updateTimeAccount(timeAccountUuid: any, params: any): Promise<any> {
        return await this.request(`/user/time-accounts/${timeAccountUuid}`, 'PUT', params);
    }

    async deleteTimeAccount(timeAccountUuid: any): Promise<any> {
        return await this.request(`/user/time-accounts/${timeAccountUuid}`, 'DELETE');
    }

    async assignTargets(timeAccountUuid: any, params: any): Promise<any> {
        return await this.request(`/user/time-accounts/${timeAccountUuid}/assign-targets`, 'POST', params);
    }

    async unassignTargets(timeAccountUuid: any, params: any): Promise<any> {
        return await this.request(`/user/time-accounts/${timeAccountUuid}/unassign-targets`, 'POST', params);
    }
}
export const timeAccountService = new TimeAccountService();
