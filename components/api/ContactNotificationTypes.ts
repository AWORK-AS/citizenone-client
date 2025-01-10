import BaseAPIService from '@/components/api/BaseAPIService'

class ContactNotificationTypes extends BaseAPIService {
    async getAllTypes(): Promise<any> {
        return await this.request(`/user/notification-types`, 'GET')
    }
}

export const contactNotificationTypes = new ContactNotificationTypes()