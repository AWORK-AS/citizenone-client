import BaseAPIService from '@/components/api/BaseAPIService'

class NotificationPreferenceService extends BaseAPIService {
    async get(): Promise<any> {
        return await this.request(`/user/notification-preferences`, 'GET')
    }

    async update(preferences: any[]): Promise<any> {
        return await this.request(`/user/notification-preferences`, 'PUT', { preferences })
    }
}

export const notificationPreferenceService = new NotificationPreferenceService()
