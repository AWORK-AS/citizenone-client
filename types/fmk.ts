/** Shapes returned by GET /user/citizens/{uuid}/fmk/medicine-card (FmkMedicineCardResource). */

export type FmkRaw = string | { [key: string]: FmkRaw | FmkRaw[] }

export interface FmkDrugMedication {
    identifier: string
    version: string
    type: string | null
    drug_name: string | null
    drug_identifier: string | null
    detailed_drug_text: string | null
    substances: string[]
    route_code: string | null
    indication_code: string | null
    reported_by: Record<string, any> | null
    modified_nonclinical: Record<string, any> | null
    reimbursement_clause: FmkRaw | null
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
    /** FMK's own wording of the whole structured dosage (GK 5). */
    dosage_text: { short: string | null, long: string | null } | null
    dosage_unit: string | null
    dosage_periods: FmkDosagePeriod[]
    /** Vitamin K antagonist (warfarin, phenprocoumon): GK 5.2.1. */
    is_vka: boolean
    paused: Record<string, any> | null
    withdrawn: Record<string, any> | null
    follow_up_dates: FmkRaw | null
    /** Follow-up dates, sorted (GK 3.15). */
    follow_up: string[]
    has_negative_consent: boolean
    is_dose_dispensed: boolean
    effectuations: number
    prescriptions: number
    /** Prescriptions that can still be dispensed (GK 3.16). */
    open_prescriptions: number
    prescription_list: FmkPrescription[]
    effectuation_list: FmkEffectuation[]
    more_effectuations: boolean
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

export type FmkRowStatus = 'same' | 'changed_in_fmk' | 'only_fmk' | 'only_local' | 'missing_in_fmk' | 'withdrawn_in_fmk'

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
    loose_prescription_list: FmkPrescription[]
    ordered_prescriptions_exist: boolean
    dose_dispensing: Record<string, any> | null
    /** GK 7.1/7.2 */
    dose_dispensing_summary: {
        start: string | null, end: string | null, deadline: string | null
        latest_effectuation: Record<string, any> | null
        has_open_prescriptions: boolean
        ordered_at_pharmacy: Record<string, any> | null
        on_hold: boolean
    } | null
    /** Who last changed the card (GK 3.5.5-3.5.10). */
    modified: Record<string, any> | null
    reported_by: Record<string, any> | null
    drug_medications: FmkDrugMedication[]
}

export interface FmkMedicineCardResponse {
    citizen_uuid: string
    environment: string
    /** Set when privacy-marked medication is shown (GK 4.3). */
    negative_consent: 'consent' | 'emergency' | null
    /** Withdrawn drug medications were asked for (GK 3.9). */
    include_withdrawn: boolean
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

/** One dosage period of a structured dosage, in FMK's wording. */
export interface FmkDosagePeriod {
    start: string | null
    end: string | null
    undetermined: boolean
    /** Repeats every N days (7 = week schedule); null = not repeated. */
    iteration_days: number | null
    /** A period without dosage. */
    empty: boolean
    short: string | null
    long: string | null
    supplementary: string | null
    days: { number: number, doses: unknown[] }[]
}

/** A dispensing or administration registered on FMK (GK 3.16, 6.2, 13.3). */
export interface FmkEffectuation {
    identifier: string | null
    date_time: string | null
    /** "indgivet", "udleveret", "en- eller flergangs apoteksudlevering", "dosisdispenseret apoteksudlevering" */
    method: string | null
    created: Record<string, any> | null
    reported_by: Record<string, any> | null
    dose_quantity: string | null
    dose_unit: string | null
    package_quantity: number | null
    package_number: string | null
    package_size: string | null
    drug_name: string | null
    according_to_drug_medication: boolean
}

/** A prescription with what GK 6 asks to be shown. */
export interface FmkPrescription {
    identifier: string | null
    status: string | null
    valid_from: string | null
    valid_to: string | null
    authorised_at: string | null
    created: Record<string, any> | null
    terminated_at: string | null
    latest_effectuation_at: string | null
    drug_name: string | null
    form: string | null
    strength: string | null
    package_number: string | null
    package_size_text: string | null
    package_quantity: number | null
    dosage_text: string | null
    reiteration: { number: number, interval: number, unit: string | null } | null
    dose_dispensed: { start: string | null, end: string | null } | null
    substitution_allowed: boolean
    reimbursement_clause: string | null
    indication: string | null
    supplementary: string | null
    invalidation_reason: string | null
    deprecated_at: string | null
    is_private: boolean
    effectuations: FmkEffectuation[]
}

export interface FmkDoseDispensingWarning { code: string | null, text: string | null, severity: string | null }

/** GET .../fmk/dose-dispensing-card (GK 7.3). */
export interface FmkDoseDispensingCardResponse {
    on_hold: Record<string, any> | null
    cards: {
        identifier: string | null
        description: string | null
        is_invalid: boolean
        warnings: FmkDoseDispensingWarning[]
        ordered_at_pharmacy: Record<string, any> | null
        packed_at: Record<string, any> | null
        packing_group: string | null
        normal_period_days: number | null
        unit_label: string | null
        periods: {
            status: string | null
            start: string | null
            end: string | null
            deadline: string | null
            effectuation_date: string | null
            expected_delivery: string | null
            private_medications: number
            medications: {
                short_name: string | null
                description: string | null
                administration_instruction: string | null
                total_quantity: string | null
                end_date: string | null
                warnings: FmkDoseDispensingWarning[]
                drug_medication: FmkDrugMedication | null
            }[]
        }[]
    }[]
}

/** A prescription request through FMK (GK 16). status: unhandled, prescribed or cancelled. */
export interface FmkPrescriptionRequest {
    identifier: string | null
    drug_medication_id: string | null
    status: 'unhandled' | 'prescribed' | 'cancelled' | string | null
    created: Record<string, any> | null
    organisations: Record<string, any>[]
    package_number: string | null
    package_quantity: number | null
    reiteration: { number: number, interval: number, unit: string | null } | null
    prescription_id: string | null
    cancelled_by: Record<string, any> | null
    cancellation_reason: string | null
}

/** Who a prescription request goes to. */
export interface FmkAddressee { name: string, type: 'Yder' | 'Sygehus' | 'Kommune', id_source: 'Yder' | 'SOR' | 'SKS', id: string }

/** One item in the FMK order basket (GK 16.5). ready: an open prescription can be dispensed now. */
export interface FmkBasketItem {
    uuid: string
    fmk_drug_medication_id: string
    drug_name: string | null
    state: 'ready' | 'waiting'
    prescription_id: string | null
    added_at: string | null
}

export interface FmkPharmacy { name: string, id_source: 'SOR' | 'EAN-Lokationsnummer' | 'CVR-P', id: string }
