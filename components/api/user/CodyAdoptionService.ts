import BaseAPIService from '@/components/api/BaseAPIService'

// One place for the paths, so a prefix change on the backend is a one-line edit.
const BASE = '/user/cody'

export interface CodyAdoptionStatus {
    has_access: boolean
    company_has_cody: boolean
    can_manage: boolean
    trial: {
        available: boolean
        status: string | null
        active: boolean
        ends_at: string | null
        days_left: number | null
        first_charge_at?: string | null
        frequency?: 'monthly' | 'yearly' | null
        amount_gross?: number | string | null
        currency?: string | null
        paid_seats_free?: number | null
    }
    requested_recently: boolean
    app_uuid?: string | null
    app_slug?: string | null
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

    async requestFromAdmin(): Promise<CodyRequestResult> {
        const response: any = await this.request(`${BASE}/request`, 'POST')
        return response?.data ?? response
    }
}

export const codyAdoptionService = new CodyAdoptionService()
