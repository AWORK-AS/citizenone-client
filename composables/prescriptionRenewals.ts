/**
 * Prescription renewal requests from the patient portal, the parts the staff inbox and the patient's
 * Prescriptions page share. Kept free of Vue so it can be unit tested.
 *
 *   awaiting_answers -> pending -> approved -> prescribed
 *                               -> rejected
 */

export type RenewalStatus = 'awaiting_answers' | 'pending' | 'approved' | 'rejected' | 'prescribed'

/** In the order the inbox filters show them; waiting for staff first. */
export const RENEWAL_STATUSES: RenewalStatus[] = ['pending', 'approved', 'awaiting_answers', 'prescribed', 'rejected']

const BADGES: Record<RenewalStatus, string> = {
    awaiting_answers: 'badge-gray',
    pending: 'badge-orange',
    approved: 'badge-blue',
    rejected: 'badge-red',
    prescribed: 'badge-green',
}

export function renewalBadgeClass(status: string | null | undefined): string {
    return BADGES[status as RenewalStatus] ?? 'badge-gray'
}

/** Staff can approve or reject only what is waiting for them. */
export function canDecide(status: string | null | undefined): boolean {
    return status === 'pending'
}

/** The prescription is made once the request is approved. */
export function canPrescribe(status: string | null | undefined): boolean {
    return status === 'approved'
}

/** Where "Create prescription" goes: the patient's medicine card, which opens the add dialog for the request. */
export function prescribeLink(renewal: { uuid?: string, citizen?: { uuid?: string } | null } | null | undefined): string | null {
    if (!renewal?.uuid || !renewal.citizen?.uuid) return null
    return `/citizens/${renewal.citizen.uuid}/medicine-journals?renewal=${encodeURIComponent(renewal.uuid)}`
}

export type PatientRenewalAction = 'request' | 'answer' | 'waiting'

/**
 * What the patient can do for one of their prescriptions: ask for a renewal, answer the questionnaire their
 * request is waiting for, or wait for the clinic.
 */
export function patientRenewalAction(prescription: { open_request?: { status?: string, survey_assignment_uuid?: string | null } | null }): PatientRenewalAction {
    const open = prescription?.open_request
    if (!open) return 'request'
    if (open.status === 'awaiting_answers' && open.survey_assignment_uuid) return 'answer'
    return 'waiting'
}
