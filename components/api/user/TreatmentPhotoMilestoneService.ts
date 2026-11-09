import BaseAPIService from '@/components/api/BaseAPIService'

class TreatmentPhotoMilestoneService extends BaseAPIService {
    async getMilestones(): Promise<any> {
        return await this.request(`/user/treatment-photo-milestones`, 'GET')
    }

    async saveMilestone(params: object): Promise<any> {
        return await this.request(`/user/treatment-photo-milestones`, 'POST', params)
    }

    async updateMilestone(uuid: string, params: object): Promise<any> {
        return await this.request(`/user/treatment-photo-milestones/${uuid}`, 'PATCH', params)
    }

    async deleteMilestone(uuid: string): Promise<any> {
        return await this.request(`/user/treatment-photo-milestones/${uuid}`, 'DELETE')
    }

    async reorderMilestones(uuids: string[]): Promise<any> {
        return await this.request(`/user/treatment-photo-milestones/reorder`, 'POST', { uuids })
    }
}

export const treatmentPhotoMilestoneService = new TreatmentPhotoMilestoneService()
