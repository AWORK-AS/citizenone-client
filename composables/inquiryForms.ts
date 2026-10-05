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
