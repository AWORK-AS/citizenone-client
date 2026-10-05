import BaseAPIService from '@/components/api/BaseAPIService'

class DischargeReasonService extends BaseAPIService {
    async getReasons(): Promise<any> {
        return await this.request(`/user/discharge-reasons/all/list`, 'GET')
    }

    async saveReason(params: object): Promise<any> {
        return await this.request(`/user/discharge-reasons`, 'POST', params)
    }

    async updateReason(uuid: string, params: object): Promise<any> {
        return await this.request(`/user/discharge-reasons/${uuid}`, 'PUT', params)
    }

    async deleteReason(uuid: string): Promise<any> {
        return await this.request(`/user/discharge-reasons/${uuid}`, 'DELETE')
    }

    async reorderReasons(uuids: string[]): Promise<any> {
        return await this.request(`/user/discharge-reasons/reorder`, 'PUT', { uuids })
    }

    async getReport(params: { from?: string, to?: string }): Promise<any> {
        return await this.request(`/user/discharge-reasons/report`, 'GET', params)
    }
}

export const dischargeReasonService = new DischargeReasonService()
