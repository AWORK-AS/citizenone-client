import BaseAPIService from '@/components/api/user/BaseAPIService'

class NotificationService extends BaseAPIService {
    async getNotifications(): Promise<any> {
        return await this.request(`/user/notifications`, 'GET')
    }

    async getNotification(notificationId: any): Promise<any> {
        return await this.request(`/user/notifications/${notificationId}`, 'GET')
    }

    async markAsRead(notificationId: any): Promise<any> {
        return await this.request(`/user/notifications/${notificationId}`, 'PUT')
    }

    async markAllAsRead(): Promise<any> {
        return await this.request(`/user/notifications/mark/all/read`, 'PUT')
    }
}

export const notificationService = new NotificationService()