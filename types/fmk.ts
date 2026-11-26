/** Shapes returned by GET /user/citizens/{uuid}/fmk/medicine-card (FmkMedicineCardResource). */

export type FmkRaw = string | { [key: string]: FmkRaw | FmkRaw[] }

export interface FmkDrugMedication {
    identifier: string
    version: string
    type: string | null
    drug_name: string | null
    drug_identifier: string | null
    atc_code: string | null
    atc_text: string | null
    form: string | null
    strength: string | null
    indication: string | null
    route: string | null
    treatment_start: string | null
    treatment_end: string | null
    dosage_type: string | null
    dosage_free_text: string | null
    dosage_by_local_schema: boolean
    dosage_structures: FmkRaw | null
    paused: Record<string, any> | null
    withdrawn: Record<string, any> | null
    follow_up_dates: FmkRaw | null
    has_negative_consent: boolean
    is_dose_dispensed: boolean
    effectuations: number
    prescriptions: number
    created: Record<string, any> | null
    modified: Record<string, any> | null
}

export interface FmkLocalMedicine {
    uuid: string
    name: string | null
    strength: string | null
    treatment_reason: string | null
    start_date: string | null
    end_date: string | null
    is_pn_medicine: boolean
    is_draft: boolean
    fmk_drug_medication_id: string | null
    fmk_drug_medication_version: string | null
}

export type FmkRowStatus = 'same' | 'changed_in_fmk' | 'only_fmk' | 'only_local' | 'missing_in_fmk'

export interface FmkRow {
    key: string
    fmk: FmkDrugMedication | null
    local: FmkLocalMedicine | null
    status: FmkRowStatus
}

export interface FmkCardSummary {
    version: string | null
    patient: FmkRaw | null
    reviewed: Record<string, any> | null
    never_reviewed: boolean
    not_reviewed: Record<string, any> | null
    is_invalid: boolean
    organisation_relations: Record<string, any>[]
    hidden_by_negative_consent: number
    loose_prescriptions: number
    ordered_prescriptions_exist: boolean
    dose_dispensing: Record<string, any> | null
    drug_medications: FmkDrugMedication[]
}

export interface FmkMedicineCardResponse {
    citizen_uuid: string
    environment: string
    /** Set when privacy-marked medication is shown (GK 4.3). */
    negative_consent: 'consent' | 'emergency' | null
    fetched_at: string
    card: FmkCardSummary
    raw: Record<string, any>
    rows: FmkRow[]
}

/** One version of a drug medication in FMK (GET .../fmk/drug-medications/{id}/history). */
export interface FmkHistoryPeriod {
    version: string | null
    from: string | null
    to: string | null
    drug_name: string | null
    form: string | null
    strength: string | null
    dosage_free_text: string | null
    dosage_type: string | null
    dosage_by_local_schema: boolean
    paused: { from: string | null, to: string | null } | null
}
