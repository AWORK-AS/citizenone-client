import BaseAPIService from '@/components/api/user/BaseAPIService'

class ActivityLogService extends BaseAPIService {
    async getActivityLogs(params: object): Promise<any> {
        return await this.request(`/user/activity-logs`, 'GET', params)
    }

    async getActivityLogPerUser(params: object): Promise<any> {
        return await this.request(`/user/activity-logs/current/user`, 'GET', params)
    }
}

export const activityLogService = new ActivityLogService()