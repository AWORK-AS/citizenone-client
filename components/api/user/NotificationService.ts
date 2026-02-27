import BaseAPIService from '@/components/api/BaseAPIService'

class NotificationService extends BaseAPIService {
    async getNotifications(params?: any): Promise<any> {
        return await this.request(`/user/notifications`, 'GET', params)
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

    async getSystemNotifications(params?: any): Promise<any> {
        return await this.request(`/user/system-notifications`, 'GET', params)
    }

    async getSystemNotification(notificationId: any): Promise<any> {
        return await this.request(`/user/system-notifications/${notificationId}`, 'GET')
    }

    async markSystemNotificationAsRead(notificationId: any): Promise<any> {
        return await this.request(`/user/system-notifications/${notificationId}`, 'PUT')
    }

    async markAllSystemNotificationsAsRead(): Promise<any> {
        return await this.request(`/user/system-notifications/mark/all/read`, 'PUT')
    }

}

export const notificationService = new NotificationService()