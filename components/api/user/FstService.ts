import BaseAPIService from '@/components/api/BaseAPIService'
import type { FstConnectionStatusResponse, FstInquiry, FstAnalyticsSnapshot, FstSyncRun } from '@/types'

// Manage/configure-screen actions (plan §14) — distinct from AppService's
// activateFreeApp(), which only handles marketplace installation (plan §9
// condition 1). This service covers conditions 2-5 and the resulting data.
class FstService extends BaseAPIService {
    // getStatus/activate/deactivate/reactivate/disconnect all return the status
    // resource's ->resolve()'d array directly (no `data` envelope) — only
    // refreshRemoteStatus() below returns the Resource itself and gets Laravel's
    // automatic `data`-wrapping. Match each shape exactly rather than "fixing"
    // the inconsistency here, which would require a backend + test change too.
    async getStatus(): Promise<FstConnectionStatusResponse> {
        return await this.request('/user/fst/status', 'GET')
    }

    async activate(cvr: string): Promise<FstConnectionStatusResponse> {
        return await this.request('/user/fst/activate', 'POST', { cvr })
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

    async getInquiries(): Promise<{ data: FstInquiry[]; reason?: string }> {
        return await this.request('/user/fst/inquiries', 'GET')
    }

    async getAnalytics(): Promise<{ data: FstAnalyticsSnapshot[]; reason?: string }> {
        return await this.request('/user/fst/analytics', 'GET')
    }

    async getSyncHistory(): Promise<{ data: FstSyncRun[] }> {
        return await this.request('/user/fst/sync-history', 'GET')
    }

    async triggerSync(): Promise<any> {
        return await this.request('/user/fst/sync', 'POST')
    }

    async updateSharedFields(fields: Array<{ field_key: string; is_enabled: boolean }>): Promise<any> {
        return await this.request('/user/fst/shared-fields', 'PUT', { fields })
    }
}

export const fstService = new FstService()
