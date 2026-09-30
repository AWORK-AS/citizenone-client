/**
 * Exact copies of resources/lang/{dk,en,no,sv}/exception.php's
 * basis_user_limit_exceeded.message - the backend returns a translated
 * string, not a machine-readable code, so callers match on the message
 * itself (same convention as the storage-limit check in procedure/form.vue).
 */
const BASIS_USER_LIMIT_MESSAGES = [
    'The Basis plan is limited to 4 users. Upgrade to Pro to add more.',
    'Basis-planen er begrænset til 4 brugere. Opgrader til Pro for at tilføje flere.',
    'Basis-planen er begrenset til 4 brukere. Oppgrader til Pro for å legge til flere.',
    'Basis-planen är begränsad till 4 användare. Uppgradera till Pro för att lägga till fler.',
]

export function isBasisUserLimitError(message?: string | null): boolean {
    return !!message && BASIS_USER_LIMIT_MESSAGES.includes(message)
}
