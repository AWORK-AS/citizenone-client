import BaseAPIService from '@/components/api/BaseAPIService'

class NotificationService extends BaseAPIService {
    async getNotifications(): Promise<any> {
        return await this.request(`/user/notifications`, 'GET')
    }

    async markAsRead(notificationUuid: any): Promise<any> {
        return await this.request(`/user/notifications/${notificationUuid}`, 'PUT')
    }

    async markAllAsRead(): Promise<any> {
        return await this.request(`/user/notifications/mark/all/read`, 'PUT')
    }
}

export const notificationService = new NotificationService()