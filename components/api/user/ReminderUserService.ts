import BaseAPIService from '@/components/api/user/BaseAPIService'

class ReminderUserService extends BaseAPIService {
    async getRemindersUsers(): Promise<any> {
        return await this.request(`/user/reminder-users`, 'GET')
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