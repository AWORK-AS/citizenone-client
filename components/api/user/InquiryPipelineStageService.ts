import BaseAPIService from '@/components/api/BaseAPIService'

class InquiryPipelineStageService extends BaseAPIService {
    async getStages(): Promise<any> {
        return await this.request(`/user/inquiry-pipeline-stages/all/list`, 'GET')
    }

    async saveStage(params: object): Promise<any> {
        return await this.request(`/user/inquiry-pipeline-stages`, 'POST', params)
    }

    async updateStage(stageUuid: string, params: object): Promise<any> {
        return await this.request(`/user/inquiry-pipeline-stages/${stageUuid}`, 'PUT', params)
    }

    async deleteStage(stageUuid: string): Promise<any> {
        return await this.request(`/user/inquiry-pipeline-stages/${stageUuid}`, 'DELETE')
    }

    async reorderStages(uuids: string[]): Promise<any> {
        return await this.request(`/user/inquiry-pipeline-stages/reorder`, 'PUT', { uuids })
    }
}

export const inquiryPipelineStageService = new InquiryPipelineStageService()
