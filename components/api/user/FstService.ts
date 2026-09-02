import BaseAPIService from '@/components/api/BaseAPIService'
import type { FstConnectionStatusResponse, FstInquiry, FstAnalyticsSnapshot, FstSyncRun, FstPageMeta } from '@/types'

// Manage/configure-screen actions (plan §14) — distinct from AppService's
// activateFreeApp(), which only handles marketplace installation (plan §9
// condition 1). This service covers conditions 2-5 and the resulting data.
class FstService extends BaseAPIService {
    // activate/deactivate/reactivate/disconnect return the status resource's
    // ->resolve()'d array directly (no `data` envelope) — but status() and
    // refreshRemoteStatus() below both return the bare Resource from the
    // controller, which Laravel wraps in `data` by default. Match each shape
    // exactly rather than "fixing" the inconsistency here, which would require
    // a backend + test change too.
    async getStatus(): Promise<FstConnectionStatusResponse> {
        const res = await this.request('/user/fst/status', 'GET')
        return res.data
    }

    // The CVR is never sent from the client — the backend always verifies the
    // company's own registered CVR, so there's nothing to pass here.
    async activate(): Promise<FstConnectionStatusResponse> {
        return await this.request('/user/fst/activate', 'POST')
    }

    async deactivate(): Promise<FstConnectionStatusResponse> {
        return await this.request('/user/fst/deactivate', 'PATCH')
    }

    // Resume from suspended without redoing CVR entry/verification — distinct
    // from activate(), which is for a fresh request after rejection/disconnection.
    async reactivate(): Promise<FstConnectionStatusResponse> {
        return await this.request('/user/fst/reactivate', 'PATCH')
    }

    async disconnect(): Promise<FstConnectionStatusResponse> {
        return await this.request('/user/fst/connection', 'DELETE')
    }

    async rotateSecret(): Promise<any> {
        return await this.request('/user/fst/rotate-secret', 'POST')
    }

    async refreshRemoteStatus(): Promise<FstConnectionStatusResponse> {
        const res = await this.request('/user/fst/refresh-status', 'POST')
        return res.data
    }

    async getInquiries(page = 1): Promise<{ data: FstInquiry[]; reason?: string; meta?: FstPageMeta | null }> {
        return await this.request('/user/fst/inquiries', 'GET', { page })
    }

    async getAnalytics(from?: string, to?: string): Promise<{ data: FstAnalyticsSnapshot[]; reason?: string }> {
        return await this.request('/user/fst/analytics', 'GET', from && to ? { from, to } : {})
    }

    async getSyncHistory(page = 1): Promise<{ data: FstSyncRun[]; meta?: FstPageMeta | null }> {
        return await this.request('/user/fst/sync-history', 'GET', { page })
    }

    async triggerSync(): Promise<any> {
        return await this.request('/user/fst/sync', 'POST')
    }

    async updateSharedFields(fields: Array<{ field_key: string; is_enabled: boolean }>): Promise<any> {
        return await this.request('/user/fst/shared-fields', 'PUT', { fields })
    }
}

export const fstService = new FstService()
