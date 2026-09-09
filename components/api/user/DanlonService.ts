import BaseAPIService from '@/components/api/BaseAPIService'

class DanlonService extends BaseAPIService {
    async authorize(): Promise<any> {
        return await this.request('/user/danlon/authorize', 'GET')
    }

    async getStatus(): Promise<any> {
        return await this.request('/user/danlon/status', 'GET')
    }

    async getEmployees(): Promise<any> {
        return await this.request('/user/danlon/employees', 'GET')
    }

    async getSalaryTypes(): Promise<any> {
        return await this.request('/user/danlon/salary-types', 'GET')
    }

    async getSupplementTypes(): Promise<any> {
        return await this.request('/user/danlon/supplement-types', 'GET')
    }

    async syncTimeRegistrations(registrations: any[]): Promise<any> {
        return await this.request('/user/danlon/time-registrations/bulk', 'POST', { registrations })
    }

    async disconnect(): Promise<any> {
        return await this.request('/user/danlon/disconnect', 'POST')
    }
}

export const danlonService = new DanlonService()
