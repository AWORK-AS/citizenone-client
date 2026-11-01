import BaseAPIService from '@/components/api/BaseAPIService'

class RecruitmentCaseService extends BaseAPIService {
    async getCases(params: object): Promise<any> {
        return await this.request(`/user/recruitment-cases`, 'GET', params)
    }

    async getCase(uuid: string): Promise<any> {
        return await this.request(`/user/recruitment-cases/${uuid}`, 'GET')
    }

    async createCase(params: object): Promise<any> {
        return await this.request(`/user/recruitment-cases`, 'POST', params)
    }

    async updateCase(uuid: string, params: object): Promise<any> {
        return await this.request(`/user/recruitment-cases/${uuid}`, 'PUT', params)
    }

    async deleteCase(uuid: string): Promise<any> {
        return await this.request(`/user/recruitment-cases/${uuid}`, 'DELETE')
    }

    async updateStatus(uuid: string, params: { status: 'open' | 'not_solved', outcome_note?: string | null }): Promise<any> {
        return await this.request(`/user/recruitment-cases/${uuid}/status`, 'PUT', params)
    }

    async chooseConsultant(uuid: string, params: { consultant_uuid: string, add_to_citizen?: boolean, outcome_note?: string | null }): Promise<any> {
        return await this.request(`/user/recruitment-cases/${uuid}/consultant`, 'PUT', params)
    }

    async getHistory(uuid: string): Promise<any> {
        return await this.request(`/user/recruitment-cases/${uuid}/history`, 'GET')
    }

    async addNote(uuid: string, content: string): Promise<any> {
        return await this.request(`/user/recruitment-cases/${uuid}/notes`, 'POST', { content })
    }

    async exportCases(params: object): Promise<Blob | null> {
        return await this.requestBlob(`/user/recruitment-cases/export/download`, 'GET', params)
    }
}

export const recruitmentCaseService = new RecruitmentCaseService()
