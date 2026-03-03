import BaseAPIService from '@/components/api/BaseAPIService'

class SalaryDkService extends BaseAPIService {
    async connect(apiKey: string): Promise<any> {
        const token = localStorage.getItem('_token')
        return await $fetch('/api/user/salary-dk/connect', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
            body: { api_key: apiKey },
        })
    }

    async getSalaryDkStatus(): Promise<any> {
        const token = localStorage.getItem('_token')
        return await $fetch('/api/user/salary-dk/status', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        })
    }

    async getEmployees(): Promise<any> {
        const token = localStorage.getItem('_token')
        return await $fetch('/api/user/salary-dk/employees', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        })
    }

    async getSalaryTypes(): Promise<any> {
        const token = localStorage.getItem('_token')
        return await $fetch('/api/user/salary-dk/salary-types', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        })
    }

    async getSupplementTypes(): Promise<any> {
        const token = localStorage.getItem('_token')
        return await $fetch('/api/user/salary-dk/supplement-types', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        })
    }

    async syncTimeRegistrations(registrations: any[]): Promise<any> {
        const token = localStorage.getItem('_token')
        return await $fetch('/api/user/salary-dk/time-registrations', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
            body: { registrations },
        })
    }

    async syncCoarseTimeRegistration(payload: any): Promise<any> {
        const token = localStorage.getItem('_token')
        return await $fetch('/api/user/salary-dk/coarse-time-registrations', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
            body: payload,
        })
    }

    async disconnectSalaryDk(): Promise<any> {
        const token = localStorage.getItem('_token')
        return await $fetch('/api/user/salary-dk/disconnect', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        })
    }
}

export const salaryDkService = new SalaryDkService()
