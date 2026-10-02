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

    // Customer accounts are archived (true) or restored (false), never deleted,
    // so the employee's journals and history stay intact.
    async archiveAccount(accountUuid: any, archived: boolean): Promise<any> {
        return await this.request(`/superadmin/accounts/${accountUuid}/archive`, 'PUT', { archived })
    }

    async activateDeactiveAccount(accountUuid: any, params: object): Promise<any> {
        return await this.request(`/superadmin/accounts/${accountUuid}/update-status `, 'PUT', params)
    }

    async impersonateAccount(accountUuid: any): Promise<any> {
        return await this.request(`/superadmin/accounts/${accountUuid}/impersonate`, 'POST')
    }

    async getCurrentAccount(): Promise<any> {
        return await this.request(`/superadmin`, 'GET')
    }

    async getAllAccountUsers(): Promise<any> {
        return await this.request(`/superadmin/account-users/all/list`, 'GET')
    }
}

export const accountService = new AccountService()