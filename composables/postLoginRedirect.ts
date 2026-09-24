/**
 * A deep link (e.g. from an email notification) that hits an API 401 gets
 * bounced to "/" with no memory of where it was headed, so the user re-lands
 * on their role's default page instead of the page the link pointed to.
 * BaseAPIService.revokeAccess() attaches the original path as ?redirect=,
 * and this resolves it back once login succeeds.
 */
export function resolvePostLoginRedirect(role: string | undefined, user?: any): string {
    const route = useRoute()
    const redirect = route.query.redirect

    if (typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')) {
        return redirect
    }

    // A clinic's citizens are patients, and they land in the patient portal
    // instead of the citizen portal. This used to be guessed from the company
    // industry being `dental`, which is not the predicate the API gates
    // /patient on: it gates on the `patient-access` app being bought, so a
    // non-dental clinic that had paid for it was sent to the citizen portal,
    // where its sections are switched off. The server now reports the
    // entitlement it enforces. AW-2026-5434.
    if (role === 'Citizen') {
        return user?.is_patient_portal
            ? '/patient/overview'
            : '/citizen/overview'
    }

    if (role === 'Relative') return '/relative/citizens'
    if (role === 'ThirdParty') return '/third-party/messages'

    return '/overview'
}
