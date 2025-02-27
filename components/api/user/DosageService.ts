import BaseAPIService from '@/components/api/user/BaseAPIService'

class DosageService extends BaseAPIService {
    async getAllDosages(): Promise<any> {
        return await this.request(`/user/dosages/all/list`, 'GET')
    }
}

export const dosageService = new DosageService()