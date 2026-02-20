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

    async updatePreset(presetUuid: string, params: object): Promise<any> {
        return await this.request(`/user/draft-schedule-presets/${presetUuid}`, 'PUT', params)
    }

    async deletePreset(presetUuid: string): Promise<any> {
        return await this.request(`/user/draft-schedule-presets/${presetUuid}`, 'DELETE')
    }

    async previewPreset(params: object): Promise<any> {
        return await this.request(`/user/draft-schedule-presets/all/preview-current-drafts`, 'GET', params)
    }

    async applyPresetPreview(presetUuid: string, params: object): Promise<any> {
        return await this.request(`/user/draft-schedule-preset-apply/${presetUuid}/preview`, 'POST', params)
    }

    async applyPreset(presetUuid: string, params: object): Promise<any> {
        return await this.request(`/user/draft-schedule-preset-apply/${presetUuid}/apply`, 'POST', params)
    }
}

export const draftSchedulePresetService = new DraftSchedulePresetService()