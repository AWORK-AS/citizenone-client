import BaseAPIService from '@/components/api/user/BaseAPIService'

class ReminderService extends BaseAPIService {
    async getReminders(): Promise<any> {
        return await this.request(`/user/reminders`, 'GET')
    }

    async getReminder(reminderUuid: any): Promise<any> {
        return await this.request(`/user/reminders/${reminderUuid}`, 'GET')
    }

    async saveReminder(params: object): Promise<any> {
        return await this.request(`/user/reminders`, 'POST', params)
    }

    async updateReminder(reminderUuid: any, params: object): Promise<any> {
        return await this.request(`/user/reminders/${reminderUuid}`, 'PUT', params)
    }

    async deleteReminder(reminderUuid: any): Promise<any> {
        return await this.request(`/user/reminders/${reminderUuid}`, 'DELETE')
    }
}

export const reminderService = new ReminderService()