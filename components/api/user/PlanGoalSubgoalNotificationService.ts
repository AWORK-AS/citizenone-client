import BaseAPIService from '@/components/api/BaseAPIService'

class PlanGoalSubgoalNotificationService extends BaseAPIService {
    async getNotifications(params: object): Promise<any> {
        return await this.request(`/user/plan-goal-subgoal-notifications`, 'GET', params)
    }

    async getNotification(notificationId: any): Promise<any> {
        return await this.request(`/user/plan-goal-subgoal-notifications/${notificationId}`, 'GET')
    }

    async saveNotification(params: object): Promise<any> {
        return await this.request(`/user/plan-goal-subgoal-notifications`, 'POST', params)
    }

    async updateNotification(notificationId: any, params: object): Promise<any> {
        return await this.request(`/user/plan-goal-subgoal-notifications/${notificationId}`, 'PUT', params)
    }

    async deleteNotification(notificationId: any): Promise<any> {
        return await this.request(`/user/plan-goal-subgoal-notifications/${notificationId}`, 'DELETE')
    }
}
export const planGoalSubgoalNotificationService = new PlanGoalSubgoalNotificationService()