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

    async getEmployees(): Promise<any> {
        const token = localStorage.getItem('_token')
        return await $fetch('/api/zenegy/employees', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
        })
    }

    async syncUsers(employees: any[], departmentUuid?: string): Promise<any> {
        const token = localStorage.getItem('_token')
        return await $fetch('/api/zenegy/sync-users', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
            body: {
                employees,
                department_uuid: departmentUuid,
            },
        })
    }
}

export const zenegyService = new ZenegyService()
