import BaseAPIService from '@/components/api/BaseAPIService'

class CitizenCaseworkerService extends BaseAPIService {
    async getAllCitizenCaseworkers(citizenUuid: any): Promise<any> {
        if (citizenUuid) {
            return await this.request(`/user/case-workers/${citizenUuid}/all/list`, 'GET')
        } else {
            return await this.request(`/user/case-workers/all/list`, 'GET')
        }
    }
}

export const citizenCaseworkerService = new CitizenCaseworkerService()