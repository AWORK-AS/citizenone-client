/**
 * Display name for a citizen contact. A contact can be organisation-only (a
 * municipality or advisor party carried over from an inquiry has
 * `company_name` but no first or last name), so fall back to the company name
 * rather than rendering "null".
 */
export function contactDisplayName(contact: { firstname?: string | null; lastname?: string | null; company_name?: string | null } | null | undefined): string {
    if (!contact) return ''

    return [contact.firstname, contact.lastname].filter(Boolean).join(' ') || contact.company_name || ''
}
