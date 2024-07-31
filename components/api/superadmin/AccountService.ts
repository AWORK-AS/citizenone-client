import BaseAPIService from '@/components/api/BaseAPIService'

class AccountService extends BaseAPIService {
    async getAccounts(params: object): Promise<any> {
        return await this.request(`/superadmin/accounts`, 'GET', params)
    }

    async getAccount(accountUuid: any): Promise<any> {
        return await this.request(`/superadmin/accounts/${accountUuid}`, 'GET')
    }

    async saveAccount(params: object): Promise<any> {
        return await this.request(`/superadmin/accounts`, 'POST', params)
    }

    async updateAccount(accountUuid: any, params: object): Promise<any> {
        return await this.request(`/superadmin/accounts/${accountUuid}`, 'PUT', params)
    }

    async activateDeactiveAccount(accountUuid: any, params: object): Promise<any> {
        return await this.request(`/superadmin/accounts/${accountUuid}/update-status `, 'PUT', params)
    }

    async getCurrentAccount(): Promise<any> {
        return await this.request(`/superadmin`, 'GET')
    }
}

export const accountService = new AccountService()