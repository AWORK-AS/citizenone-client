import BaseAPIService from '@/components/api/BaseAPIService'

class SalaryDkService extends BaseAPIService {
    async connect(apiKey: string): Promise<any> {
        return await this.request('/user/salary-dk/connect', 'POST', { api_key: apiKey })
    }

    async getSalaryDkStatus(): Promise<any> {
        return await this.request('/user/salary-dk/status', 'GET')
    }

    async getEmployees(): Promise<any> {
        return await this.request('/user/salary-dk/employees', 'GET')
    }

    async getSalaryTypes(): Promise<any> {
        return await this.request('/user/salary-dk/salary-types', 'GET')
    }

    async getSupplementTypes(): Promise<any> {
        return await this.request('/user/salary-dk/supplement-types', 'GET')
    }

    async getLeaveTypes(): Promise<any> {
        return await this.request('/user/salary-dk/leave-types', 'GET')
    }

    async syncTimeRegistrations(registrations: any[]): Promise<any> {
        return await this.request('/user/salary-dk/time-registrations', 'POST', { registrations })
    }

    async createLeaveRegistration(payload: any): Promise<any> {
        return await this.request('/user/salary-dk/leave-registrations', 'POST', payload)
    }

    async createSupplementRegistration(payload: any): Promise<any> {
        return await this.request('/user/salary-dk/supplement-registrations', 'POST', payload)
    }

    async disconnectSalaryDk(): Promise<any> {
        return await this.request('/user/salary-dk/disconnect', 'POST')
    }
}

export const salaryDkService = new SalaryDkService()
