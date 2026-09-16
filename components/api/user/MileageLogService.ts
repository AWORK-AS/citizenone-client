import BaseAPIService from '@/components/api/BaseAPIService'

class MileageLogService extends BaseAPIService {
    async getMileageLog(params: any): Promise<any> {
        return await this.request(`/user/mileage-logs`, 'GET', params)
    }

    async getAllMileageLogs(params: any): Promise<any> {
        return await this.request(`/user/mileage-logs`, 'GET', params)
    }

    async getByEmployeeMileageLogs(employeeUuid: any, params: any): Promise<any> {
        return await this.request(`/user/mileage-logs/employee/${employeeUuid}`, 'GET', params)
    }

    // The list endpoints above don't eager-load location_logs (GPS breadcrumbs)
    // -- see backend/dev-mileage-log-locationlogs-whenloaded-bug.md -- so the
    // detail modal fetches the single-trip record separately to get them.
    async getMileageLogByUuid(mileageLogUuid: string): Promise<any> {
        return await this.request(`/user/mileage-logs/${mileageLogUuid}`, 'GET')
    }

    async getMileageSummary(params: object): Promise<any> {
        return await this.request(`/user/mileage-logs/summary`, 'GET', params)
    }

    async saveMileageLog(params: object): Promise<any> {
        return await this.request(`/user/mileage-logs`, 'POST', params)
    }

    async updateMileageLog(mileageLogUuid: any, params: object): Promise<any> {
        return await this.request(`/user/mileage-logs/${mileageLogUuid}`, 'PUT', params)
    }

    // Deliberately separate from updateMileageLog: the ordinary save path
    // ignores any kilometers the client sends (the backend never reads it), so
    // a correction is its own audited endpoint with its own permission gate and
    // its own required reason. See backend/dev-mileage-manual-distance-correction.md.
    async setMileageLogDistance(mileageLogUuid: string, params: { kilometers: number; reason: string }): Promise<any> {
        return await this.request(`/user/mileage-logs/${mileageLogUuid}/distance`, 'PUT', params)
    }

    async clearMileageLogDistance(mileageLogUuid: string): Promise<any> {
        return await this.request(`/user/mileage-logs/${mileageLogUuid}/distance`, 'DELETE')
    }

    async deleteMileageLog(mileageLogUuid: any): Promise<any> {
        return await this.request(`/user/mileage-logs/${mileageLogUuid}`, 'DELETE')
    }

    async downloadMileageLogReport(params: object): Promise<any> {
        return await this.request(`/user/mileage-logs/download/all/reports`, 'GET', params)
    }

    async downloadEmployeeMileageLogReport(employeeUuid: any, params: object): Promise<any> {
        return await this.request(`/user/mileage-logs/download/employee/${employeeUuid}/reports`, 'GET', params)
    }

    // Live GPS trip tracking — see backend/dev.md for the endpoint contract.
    async startTrip(params: object): Promise<any> {
        return await this.request(`/user/mileage-logs/start`, 'POST', params)
    }

    async getActiveTrip(): Promise<any> {
        return await this.request(`/user/mileage-logs/active`, 'GET')
    }

    async stopTrip(mileageLogUuid: string, params: object): Promise<any> {
        return await this.request(`/user/mileage-logs/${mileageLogUuid}/stop`, 'POST', params)
    }

    async cancelTrip(mileageLogUuid: string): Promise<any> {
        return await this.request(`/user/mileage-logs/${mileageLogUuid}/cancel`, 'POST')
    }
}

export const mileageLogService = new MileageLogService()
