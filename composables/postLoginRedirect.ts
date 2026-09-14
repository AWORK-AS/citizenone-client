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

    // A dental clinic's citizens are patients, and they land in the patient
    // portal instead of the citizen portal.
    if (role === 'Citizen') {
        return user?.company?.industry?.system_name === 'dental'
            ? '/patient/overview'
            : '/citizen/overview'
    }

    if (role === 'Relative') return '/relative/citizens'
    if (role === 'ThirdParty') return '/third-party/messages'

    return '/overview'
}
