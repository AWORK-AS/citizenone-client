import BaseAPIService from '@/components/api/BaseAPIService'

class ExtraHoursTagService extends BaseAPIService {
    async getExtraHoursTags(params: object): Promise<any> {
        return await this.request(`/user/extra-hours-tags`, 'GET', params)
    }

    async getExtraHoursTag(extraHoursTagUuid: any): Promise<any> {
        return await this.request(`/user/extra-hours-tags/${extraHoursTagUuid}`, 'GET')
    }

    async saveExtraHoursTag(params: object): Promise<any> {
        return await this.request(`/user/extra-hours-tags`, 'POST', params)
    }

    async updateExtraHoursTag(extraHoursTagUuid: any, params: object): Promise<any> {
        return await this.request(`/user/extra-hours-tags/${extraHoursTagUuid}`, 'PUT', params)
    }

    async deleteExtraHoursTag(extraHoursTagUuid: any): Promise<any> {
        return await this.request(`/user/extra-hours-tags/${extraHoursTagUuid}`, 'DELETE')
    }

    async getAllExtraHoursTags(params: object): Promise<any> {
        return await this.request(`/user/extra-hours-tags/all/list`, 'GET', params)
    }
}

export const extraHoursTagService = new ExtraHoursTagService()