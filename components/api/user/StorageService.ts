import BaseAPIService from '@/components/api/BaseAPIService'

class StorageService extends BaseAPIService {
    async getCitizenFileFolderCurrentUsage(): Promise<any> {
        return await this.request(`/user/citizen-file-folders/current/usage`, 'GET')
    }

    // Headline usage for the in-app quota notice: used/quota, level and whether
    // this user is allowed to buy more space.
    async getQuotaStatus(): Promise<any> {
        return await this.request(`/user/storage/quota-status`, 'GET')
    }
}

export const storageService = new StorageService()