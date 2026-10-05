// The WorkZone import answer for customer departments.

export type ImportAction = 'create' | 'update' | 'skip'

export interface ImportIssue {
    code: string
    message: string
}

export interface ImportRow {
    row: number
    external_id: string | null
    name: string | null
    customer_name: string | null
    action: ImportAction
    department_uuid: string | null
    warnings: ImportIssue[]
    errors: ImportIssue[]
}

export interface ImportResult {
    dry_run: boolean
    rows: ImportRow[]
    counts: { rows: number, create: number, update: number, skip: number, warnings: number, errors: number }
    payment_terms_added: number[]
    unmatched_municipalities: string[]
    ignored_columns: string[]
}
