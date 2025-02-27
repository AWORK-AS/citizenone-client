import BaseAPIService from '@/components/api/user/BaseAPIService'

class StorageService extends BaseAPIService {
    async getCitizenFileFolderCurrentUsage(): Promise<any> {
        return await this.request(`/user/citizen-file-folders/current/usage`, 'GET')
    }
}

export const storageService = new StorageService()