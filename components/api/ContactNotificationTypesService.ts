import BaseAPIService from '@/components/api/BaseAPIService'

class ContactNotificationTypesService extends BaseAPIService {
    async getAllTypes(): Promise<any> {
        return await this.request(`/user/notification-types/all/list`, 'GET')
    }
}

export const contactNotificationTypesService = new ContactNotificationTypesService()