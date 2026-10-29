// "No free user license" from the API. The pages used to compare the message
// text, and the Danish text they looked for was never sent, so Danish admins got
// the bare error instead of the way to buy more. The backend now sends
// `code: 'no_user_license'`; the texts stay as a fallback for an older backend.
const TEXTS = [
    'You have no available user license.',
    'Du har ingen tilgængelig brugerlisens.',
    'Du har ingen tilgængelige brugerlicenser til at oprette en ny medarbejder.',
    'Du har ingen tilgjengelig brukerlisens.',
    'Du har ingen tillgänglig användarlicens.',
]

export function isNoUserLicense(error: any): boolean {
    return error?.code === 'no_user_license' || TEXTS.includes(error?.message)
}
