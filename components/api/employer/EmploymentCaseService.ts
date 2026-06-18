import BaseAPIService from '@/components/api/BaseAPIService'

class EmploymentCaseService extends BaseAPIService {
    async getEmploymentCases(): Promise<any> {
        return await this.request(`/employer/employment-cases`, 'GET')
    }

    async getEmploymentCase(uuid: string): Promise<any> {
        return await this.request(`/employer/employment-cases/${uuid}`, 'GET')
    }
}

export const employmentCaseService = new EmploymentCaseService()
