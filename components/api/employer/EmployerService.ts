import BaseAPIService from '@/components/api/BaseAPIService'

class EmployerService extends BaseAPIService {
    async getCurrentLoggedInEmployer(): Promise<any> {
        return await this.request(`/employer`, 'GET')
    }

    async updateEmployerLanguage(params: object): Promise<any> {
        return await this.request(`/employer/update/language`, 'PUT', params)
    }
}

export const employerService = new EmployerService()
