import BaseAPIService from '@/components/api/BaseAPIService'

export interface AccountDeletionStatus {
    pending: boolean
    requested_at: string | null
}

/** "Delete my account": a request that support handles; the backend deletes nothing by itself. */
class AccountDeletionService extends BaseAPIService {
    async status(): Promise<{ data: AccountDeletionStatus }> {
        return await this.request(`/user/account-deletion-request`, 'GET')
    }

    async send(params: { reason?: string }): Promise<{ message: string, data: AccountDeletionStatus }> {
        return await this.request(`/user/account-deletion-request`, 'POST', params)
    }
}

export const accountDeletionService = new AccountDeletionService()
