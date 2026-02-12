import BaseAPIService from '@/components/api/BaseAPIService'

class ZenegyService extends BaseAPIService {
    async getAuthorizationUrl(): Promise<any> {
        // Call the Nuxt server API route which will proxy to the backend
        const token = localStorage.getItem('_token')
        return await $fetch('/api/zenegy/authorize', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        })
    }

    async getZenegyStatus(): Promise<any> {
        const token = localStorage.getItem('_token')
        return await $fetch('/api/zenegy/status', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        })
    }
}

export const zenegyService = new ZenegyService()
