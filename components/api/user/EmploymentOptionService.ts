import BaseAPIService from '@/components/api/BaseAPIService'

/**
 * The two employment dropdowns on an employee: "Arbejdstimer" and
 * "Ansættelsesstatus". The built-in options are returned with `is_system: true`
 * and no label - the client translates those - and a company's own additions
 * carry the label they were given.
 */
class EmploymentOptionService extends BaseAPIService {
    async getOptions(): Promise<any> {
        return await this.request(`/user/employment-options`, 'GET')
    }

    async createOption(params: object): Promise<any> {
        return await this.request(`/user/employment-options`, 'POST', params)
    }

    async updateOption(uuid: string, params: object): Promise<any> {
        return await this.request(`/user/employment-options/${uuid}`, 'PUT', params)
    }

    async deleteOption(uuid: string): Promise<any> {
        return await this.request(`/user/employment-options/${uuid}`, 'DELETE')
    }
}

export const employmentOptionService = new EmploymentOptionService()
