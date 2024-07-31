import BaseAPIService from '@/components/api/BaseAPIService'

class AccountService extends BaseAPIService {
    async getAccounts(params: object): Promise<any> {
        return await this.request(`/superadmin/users`, 'GET', params)
    }

    async getAccount(accountUuid: any): Promise<any> {
        return await this.request(`/superadmin/users/${accountUuid}`, 'GET')
    }

    async saveAccount(params: object): Promise<any> {
        return await this.request(`/superadmin/users`, 'POST', params)
    }

    async updateAccount(accountUuid: any, params: object): Promise<any> {
        return await this.request(`/superadmin/users/${accountUuid}`, 'PUT', params)
    }

    async getCurrentAccount(): Promise<any> {
        return await this.request(`/superadmin`, 'GET')
    }
}

export const accountService = new AccountService()