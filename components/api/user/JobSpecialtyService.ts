import BaseAPIService from '@/components/api/BaseAPIService'

class JobSpecialtyService extends BaseAPIService {
    async getJobSpecialties(params: object): Promise<any> {
        return await this.request(`/user/job-specialties`, 'GET', params)
    }

    async getJobSpecialty(jobSpecialtyUuid: any): Promise<any> {
        return await this.request(`/user/job-specialties/${jobSpecialtyUuid}`, 'GET')
    }

    async saveJobSpecialty(params: object): Promise<any> {
        return await this.request(`/user/job-specialties`, 'POST', params)
    }

    async updateJobSpecialty(jobSpecialtyUuid: any, params: object): Promise<any> {
        return await this.request(`/user/job-specialties/${jobSpecialtyUuid}`, 'PUT', params)
    }

    async getAllJobSpecialties(params: object): Promise<any> {
        return await this.request(`/user/job-specialties/all/list`, 'GET', params)
    }
}

export const jobSpecialtyService = new JobSpecialtyService()