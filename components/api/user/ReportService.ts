import BaseAPIService from '@/components/api/BaseAPIService'

class ReportService extends BaseAPIService {
    async getUserReportFollowUp(params: object): Promise<any> {
        return await this.request(`/user/report/reminder`, 'GET', params)
    }
    async getUserReportFollowUpByCitizen(citizenUuid: any): Promise<any> {
        return await this.request(`/user/report/reminder/${citizenUuid}`, 'GET')
    }
    async markReportFollowUpReminderAsViewed(uuid: any): Promise<any> {
        return await this.request(`/user/report/reminder/${uuid}/mark-as-viewed`, 'PUT')
    }
}
export const reportService = new ReportService()