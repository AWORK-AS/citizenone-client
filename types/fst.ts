// FST integration types (FST_CITIZENONE_INTEGRATION_IMPLEMENTATION_PLAN.md §14).
// Mirrors FstConnectionStatusResource on the backend — the frontend's single
// source of truth for every bilateral-activation state (plan §9, R4.4).

export type FstConnectionStatus = 'pending' | 'rejected' | 'active' | 'suspended' | 'disconnected' | null

export interface FstConnectionStatusResponse {
    installed: boolean
    co_activated_at: string | null
    fst_activated_at: string | null
    org_verified_at: string | null
    connection_status: FstConnectionStatus
    sync_eligible: boolean
    unmet_conditions: string[]
}

export interface FstInquiry {
    uuid: string
    fst_case_id: string
    listing_ref: string | null
    sender_type: string
    submission_mechanism: string | null
    status: 'new' | 'contacted' | 'closed'
    received_at: string | null
    inquirer_name: string | null
    inquirer_email: string | null
    inquirer_phone: string | null
    brief_summary: string | null
}

export interface FstAnalyticsSnapshot {
    metric_date: string
    metric_key: string
    metric_value: number
    listing_ref: string | null
}

export interface FstSyncRun {
    uuid: string
    direction: 'pull' | 'push'
    type: 'inquiries' | 'analytics' | 'profile_push'
    status: 'success' | 'failed' | 'partial' | 'skipped_ineligible'
    unmet_conditions: string[] | null
    started_at: string | null
    finished_at: string | null
    records_processed: number
    error_summary: string | null
    correlation_id: string
}
