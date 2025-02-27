import BaseAPIService from '@/components/api/user/BaseAPIService'

class JobTitleService extends BaseAPIService {
    async getJobTitles(params: object): Promise<any> {
        return await this.request(`/user/job-titles`, 'GET', params)
    }

    async getJobTitle(jobTitleUuid: any): Promise<any> {
        return await this.request(`/user/job-titles/${jobTitleUuid}`, 'GET')
    }

    async saveJobTitle(params: object): Promise<any> {
        return await this.request(`/user/job-titles`, 'POST', params)
    }

    async updateJobTitle(jobTitleUuid: any, params: object): Promise<any> {
        return await this.request(`/user/job-titles/${jobTitleUuid}`, 'PUT', params)
    }

    async getAllJobTitles(): Promise<any> {
        return await this.request(`/user/job-titles/all/list`, 'GET')
    }
}

export const jobTitleService = new JobTitleService()