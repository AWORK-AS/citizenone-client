import BaseAPIService from '@/components/api/BaseAPIService'

class DraftSchedulePresetService extends BaseAPIService {
    async getPresets(params: object): Promise<any> {
        return await this.request(`/user/draft-schedule-presets`, 'GET', params)
    }

    async getPreset(presetUuid: any): Promise<any> {
        return await this.request(`/user/draft-schedule-presets/${presetUuid}`, 'GET')
    }

    async savePreset(params: object): Promise<any> {
        return await this.request(`/user/draft-schedule-presets`, 'POST', params)
    }

    async updatePreset(presetUuid: any, params: object): Promise<any> {
        return await this.request(`/user/draft-schedule-presets/${presetUuid}`, 'PUT', params)
    }

    async deletePreset(presetUuid: any): Promise<any> {
        return await this.request(`/user/draft-schedule-presets/${presetUuid}`, 'DELETE')
    }

    async previewPreset(params: object): Promise<any> {
        return await this.request(`/user/draft-schedule-presets/all/preview-current-drafts`, 'GET', params)
    }
}

export const draftSchedulePresetService = new DraftSchedulePresetService()