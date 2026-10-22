// The forms "Ny henvendelse" offers, read the same way everywhere: the menu,
// the forms themselves and the settings page. Free of Vue so the rules run
// under node --test.

export interface InquiryForm {
    uuid: string
    name: string | null
    builtin: 'shelter' | 'crisis_center' | null
    base: 'shelter' | 'crisis_center' | 'general'
    inquiry_type: 'shelter' | 'crisis_center'
    core_fields: string[]
    available_core_fields?: string[]
    locked_core_fields?: string[]
    registration_fields?: string[]
    service_type?: { uuid: string, name: string, label: string } | null
    is_active: boolean
    sort_order: number
}

export interface BuiltinNames {
    shelter: string
    crisisCenter: string
}

/**
 * Who got in touch, as the crisis centre form offers it. Read the same way on
 * the inquiry page and on the board's cards.
 */
export const CONTACTED_BY_LABELS: Record<string, string> = {
    the_citizen_themselves: 'inquiries.form.options.contactedBy.theCitizenThemselves',
    family_friend_neighbor_colleague_acquaintance: 'inquiries.form.options.contactedBy.familyFriends',
    municipal_employee: 'inquiries.form.options.contactedBy.municipalEmployee',
    police_prison_and_probation_service: 'inquiries.form.options.contactedBy.police',
    healthcare_professional: 'inquiries.form.options.contactedBy.healthcareProfessional',
    employee_from_another_crisis_center: 'inquiries.form.options.contactedBy.employeeFromAnotherCrisisCenter',
    other: 'inquiries.form.options.contactedBy.other',
}

/**
 * A yes/no answer as the inquiry stores it: yes is true, no is false, and a
 * question nobody answered - often one the form never showed - stays null
 * rather than turning into a "no".
 */
export function yesNoToBoolean(value: unknown): boolean | null {
    if (value === 'yes') return true
    if (value === 'no') return false

    return null
}

/**
 * The name of an entry from one of the crisis centre's fixed lists (topics,
 * reasons for no intake interview, guidance). Those carry en_name and dk_name
 * rather than a name, as the form's own dropdowns read them: English for an
 * English user, the Danish name for everyone else. Anything with a plain name
 * (a department) keeps it.
 */
export function listItemName(item: { name?: string | null, en_name?: string | null, dk_name?: string | null } | null | undefined, locale: string): string {
    if (!item) return ''
    if (item.name) return item.name

    return (locale === 'en' ? item.en_name : item.dk_name) || item.en_name || item.dk_name || ''
}

/** A built-in form is called by the company's own word for it. */
export function formLabel(form: Pick<InquiryForm, 'name' | 'builtin'> | null | undefined, names: BuiltinNames): string {
    if (form?.builtin === 'shelter') return names.shelter
    if (form?.builtin === 'crisis_center') return names.crisisCenter

    return form?.name ?? ''
}

/** What "Ny henvendelse" offers, in the company's order. */
export function activeForms(forms: InquiryForm[] | null | undefined): InquiryForm[] {
    return (forms ?? [])
        .filter((form) => form.is_active)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
}

/**
 * Whether a form asks for a built-in field. The form decides; an inquiry from
 * before forms falls back to its service type's list; with neither, every
 * field is asked for, as it always was.
 */
export function asksFor(
    field: string,
    form: Pick<InquiryForm, 'core_fields'> | null | undefined,
    serviceType?: { core_fields?: string[] | null } | null,
): boolean {
    if (Array.isArray(form?.core_fields)) {
        return form.core_fields.includes(field)
    }

    const configured = serviceType?.core_fields

    return !Array.isArray(configured) || configured.includes(field)
}

/** Where a saved inquiry keeps each built-in field's answer, when not under the field's own name. */
const ANSWER_KEYS: Record<string, string> = {
    department_uuid: 'departments',
    first_name: 'firstname',
    last_name: 'lastname',
    topic: 'topics',
    assessment: 'target_group_crisis_center',
    assessment_reason: 'no_assessment_reasons',
    guidance: 'guidances',
}

/**
 * Whether a saved inquiry has an answer in a built-in field. A "no" is an
 * answer; an empty text, an empty list or an unanswered question is not.
 */
export function hasBuiltinValue(field: string, inquiry: Record<string, any> | null | undefined): boolean {
    const value = inquiry?.[ANSWER_KEYS[field] ?? field]

    if (value === null || value === undefined) return false
    if (typeof value === 'string') return value.trim() !== ''
    if (Array.isArray(value)) return value.length > 0

    return true
}

/**
 * Whether a saved inquiry shows a built-in field, on its page and when it is
 * edited. An inquiry taken on a form shows what that form asks for, plus any
 * field that already has an answer - so leaving a field off a form never hides
 * what was written in it. An inquiry from before forms shows every field, as
 * it always did.
 */
export function shownOnInquiry(
    field: string,
    form: Pick<InquiryForm, 'core_fields'> | null | undefined,
    inquiry: Record<string, any> | null | undefined,
): boolean {
    if (!Array.isArray(form?.core_fields)) return true

    return form.core_fields.includes(field) || hasBuiltinValue(field, inquiry)
}

/**
 * Why a field cannot be switched off on a form, or null when it can: either
 * every inquiry needs it, or the national registration reads it.
 */
export function lockReason(form: InquiryForm, field: string): 'always' | 'registration' | null {
    if (form.registration_fields?.includes(field)) return 'registration'
    if (form.locked_core_fields?.includes(field)) return 'always'

    return null
}

/** Toggles a field on a form's list, never taking a locked one off. */
export function toggleField(form: InquiryForm, field: string): string[] {
    const current = new Set(form.core_fields)

    if (current.has(field)) {
        if (lockReason(form, field)) return [...form.core_fields]
        current.delete(field)
    } else {
        current.add(field)
    }

    // In the order the form shows them, so the list reads like the form.
    const order = form.available_core_fields ?? [...current]

    return order.filter((key) => current.has(key))
}
