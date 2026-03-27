import BaseAPIService from '@/components/api/BaseAPIService'

class DanlonService extends BaseAPIService {
    async authorize(): Promise<any> {
        const token = localStorage.getItem('_token')
        return await $fetch('/api/user/danlon/authorize', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        })
    }

    async getStatus(): Promise<any> {
        const token = localStorage.getItem('_token')
        return await $fetch('/api/user/danlon/status', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        })
    }

    async getEmployees(): Promise<any> {
        const token = localStorage.getItem('_token')
        return await $fetch('/api/user/danlon/employees', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        })
    }

    async getSalaryTypes(): Promise<any> {
        const token = localStorage.getItem('_token')
        return await $fetch('/api/user/danlon/salary-types', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        })
    }

    async getSupplementTypes(): Promise<any> {
        const token = localStorage.getItem('_token')
        return await $fetch('/api/user/danlon/supplement-types', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        })
    }

    async syncTimeRegistrations(registrations: any[]): Promise<any> {
        const token = localStorage.getItem('_token')
        return await $fetch('/api/user/danlon/time-registrations/bulk', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
            body: { registrations },
        })
    }

    async disconnect(): Promise<any> {
        const token = localStorage.getItem('_token')
        return await $fetch('/api/user/danlon/disconnect', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        })
    }
}

export const danlonService = new DanlonService()
