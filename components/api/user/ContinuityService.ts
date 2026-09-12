import BaseAPIService from '@/components/api/BaseAPIService'

class ContinuityService extends BaseAPIService {
    async get(): Promise<any> {
        return await this.request(`/user/continuity`, 'GET')
    }

    async put(params: { type: 'citizen' | 'chat'; subject_uuid: string; label: string; device?: string }): Promise<any> {
        return await this.request(`/user/continuity`, 'PUT', params)
    }
}

export const continuityService = new ContinuityService()
