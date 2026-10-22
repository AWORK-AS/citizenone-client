/**
 * Whether a citizen's hourly rate and contribution margin are kept from the
 * signed-in person (the company switch "Hide hourly rate and contribution
 * margin from employees"). Free of Vue and auto-imports so it can be tested
 * with `node --test tests/unit/citizenRates.test.mjs`.
 *
 * Read from what the server says, never from an empty value: a citizen
 * without a rate shows the same tiles as before.
 * - the citizen's hidden_fields names hourly_rate;
 * - the contribution-margin answer carries is_hidden: true.
 */
export function areCitizenRatesHidden(citizen: any, margin?: any): boolean {
    const hidden = citizen?.hidden_fields

    if (Array.isArray(hidden) && hidden.includes('hourly_rate')) {
        return true
    }

    return margin?.data?.is_hidden === true
}
