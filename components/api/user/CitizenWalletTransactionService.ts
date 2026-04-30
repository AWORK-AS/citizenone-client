import BaseAPIService from '@/components/api/BaseAPIService'

class CitizenWalletTransactionService extends BaseAPIService {
    async getWalletTransactions(params: object): Promise<any> {
        return await this.request(`/user/citizen-wallet-transactions`, 'GET', params)
    }

    async saveWalletTransaction(params: object): Promise<any> {
        return await this.request(`/user/citizen-wallet-transactions`, 'POST', params)
    }


    async updateWalletTransaction(walletTransactionUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizen-wallet-transactions/${walletTransactionUuid}/update`, 'POST', params)
    }

    async deleteWalletTransaction(walletTransactionUuid: any): Promise<any> {
        return await this.request(`/user/citizen-wallet-transactions/${walletTransactionUuid}`, 'DELETE')
    }

    async deleteWalletTransactionFile(fileUuid: any): Promise<any> {
        return await this.request(`/user/citizen-wallet-transaction-files/${fileUuid}`, 'DELETE')
    }

    async sendWalletTransaction(params: object): Promise<any> {
        return await this.request(`/user/citizen-wallet-transactions/transactions-per-citizen/send`, 'POST', params)
    }
}

export const citizenWalletTransactionService = new CitizenWalletTransactionService()