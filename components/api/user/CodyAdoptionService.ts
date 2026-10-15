import BaseAPIService from '@/components/api/BaseAPIService'

// One place for the paths, so a prefix change on the backend is a one-line edit.
const BASE = '/user/cody'

export interface CodyAdoptionStatus {
    has_access: boolean
    company_has_cody: boolean
    can_manage: boolean
    trial: {
        available: boolean
        active: boolean
        ends_at: string | null
        days_left: number | null
    }
    requested_recently: boolean
}

export interface CodyRequestResult {
    sent: boolean
    reason?: 'recently_requested' | 'no_admin'
}

class CodyAdoptionService extends BaseAPIService {
    async getStatus(): Promise<CodyAdoptionStatus | null> {
        const response: any = await this.request(`${BASE}/adoption-status`, 'GET')
        return response?.data ?? response ?? null
    }

    async startTrial(): Promise<any> {
        return await this.request(`${BASE}/trial`, 'POST')
    }

    async requestFromAdmin(): Promise<CodyRequestResult> {
        const response: any = await this.request(`${BASE}/request`, 'POST')
        return response?.data ?? response
    }
}

export const codyAdoptionService = new CodyAdoptionService()
