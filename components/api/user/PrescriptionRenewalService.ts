import BaseAPIService from '@/components/api/BaseAPIService'

/** The staff inbox of prescription renewal requests from the patient portal. */
class PrescriptionRenewalService extends BaseAPIService {
    async getRequests(params: object): Promise<any> {
        return await this.request(`/user/prescription-renewals`, 'GET', params)
    }

    async getPendingCount(): Promise<any> {
        return await this.request(`/user/prescription-renewals/count`, 'GET')
    }

    async getRequest(uuid: string): Promise<any> {
        return await this.request(`/user/prescription-renewals/${uuid}`, 'GET')
    }

    async approve(uuid: string, params: { note?: string }): Promise<any> {
        return await this.request(`/user/prescription-renewals/${uuid}/approve`, 'PUT', params)
    }

    async reject(uuid: string, params: { note: string }): Promise<any> {
        return await this.request(`/user/prescription-renewals/${uuid}/reject`, 'PUT', params)
    }
}

export const prescriptionRenewalService = new PrescriptionRenewalService()
