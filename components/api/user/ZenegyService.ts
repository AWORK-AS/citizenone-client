import BaseAPIService from '@/components/api/BaseAPIService'

class ZenegyService extends BaseAPIService {
    async getAuthorizationUrl(): Promise<any> {
        // Call the Nuxt server API route which will proxy to the backend
        const token = localStorage.getItem('_token')
        return await $fetch('/api/user/zenegy/authorize', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        })
    }

    async getZenegyStatus(): Promise<any> {
        const token = localStorage.getItem('_token')
        return await $fetch('/api/user/zenegy/status', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        })
    }

    async getEmployees(): Promise<any> {
        const token = localStorage.getItem('_token')
        return await $fetch('/api/user/zenegy/employees', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        })
    }

    async getRates(): Promise<any> {
        const token = localStorage.getItem('_token')
        return await $fetch('/api/user/zenegy/rates', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        })
    }

    async syncRegistrations(registrations: any[]): Promise<any> {
        const token = localStorage.getItem('_token')
        return await $fetch('/api/user/zenegy/registrations', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
            body: { registrations },
        })
    }

    async getSupplementRates(): Promise<any> {
        const token = localStorage.getItem('_token')
        return await $fetch('/api/user/zenegy/supplement-rates', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        })
    }

    async syncSupplementRegistrations(registrations: any[]): Promise<any> {
        const token = localStorage.getItem('_token')
        return await $fetch('/api/user/zenegy/supplement-registrations', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
            body: { registrations },
        })
    }

    async disconnectZenegy(): Promise<any> {
        const token = localStorage.getItem('_token')
        return await $fetch('/api/user/zenegy/disconnect', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        })
    }
}

export const zenegyService = new ZenegyService()
