import BaseAPIService from '@/components/api/BaseAPIService'

class ReminderUserService extends BaseAPIService {
    async getRemindersUsers(params: object): Promise<any> {
        return await this.request(`/user/reminder-users`, 'GET', params)
    }

    async getReminderUser(reminderUuid: any): Promise<any> {
        return await this.request(`/user/reminder-users/${reminderUuid}`, 'GET')
    }

    async saveReminderUser(params: object): Promise<any> {
        return await this.request(`/user/reminder-users`, 'POST', params)
    }

    async updateReminderUser(reminderUuid: any, params: object): Promise<any> {
        return await this.request(`/user/reminder-users/${reminderUuid}`, 'PUT', params)
    }

    async deleteReminderUser(Uuid: any): Promise<any> {
        return await this.request(`/user/reminder-users/${Uuid}`, 'DELETE')
    }
}

export const reminderUserService = new ReminderUserService()