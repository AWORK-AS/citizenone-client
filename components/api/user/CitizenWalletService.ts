import BaseAPIService from '@/components/api/BaseAPIService'

class CitizenWalletService extends BaseAPIService {
    async getWallets(params: object): Promise<any> {
        return await this.request(`/user/citizen-wallets`, 'GET', params)
    }

    async getWalletsPerCitizen(params: object): Promise<any> {
        return await this.request(`/user/citizen-wallets/all/list`, 'GET', params)
    }

    async getWallet(walletUuid: any): Promise<any> {
        return await this.request(`/user/citizen-wallets/${walletUuid}`, 'GET')
    }

    async saveWallet(params: object): Promise<any> {
        return await this.request(`/user/citizen-wallets`, 'POST', params)
    }

    async updateWallet(walletUuid: any, params: object): Promise<any> {
        return await this.request(`/user/citizen-wallets/${walletUuid}`, 'PUT', params)
    }

    async deleteWallet(walletUuid: any): Promise<any> {
        return await this.request(`/user/citizen-wallets/${walletUuid}`, 'DELETE')
    }
}

export const citizenWalletService = new CitizenWalletService()