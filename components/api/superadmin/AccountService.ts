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

    async deleteAccount(accountUuid: any): Promise<any> {
        return await this.request(`/superadmin/accounts/${accountUuid}`, 'DELETE')
    }

    async activateDeactiveAccount(accountUuid: any, params: object): Promise<any> {
        return await this.request(`/superadmin/accounts/${accountUuid}/update-status `, 'PUT', params)
    }

    async getCurrentAccount(): Promise<any> {
        return await this.request(`/superadmin`, 'GET')
    }

    async getAllAccountUsers(): Promise<any> {
        return await this.request(`/superadmin/account-users/all/list`, 'GET')
    }
}

export const accountService = new AccountService()