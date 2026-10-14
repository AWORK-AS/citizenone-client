/**
 * "Del CitizenOne" (task #16): where each way of sharing sends the user's personal link.
 *
 * Plain functions with no imports, so `node --test tests/unit/platformShare.test.mjs` can run them.
 * The mobile app builds the same links in utils/platformShare.ts there.
 */
export type PlatformShareMethod = 'copy' | 'email' | 'sms' | 'linkedin' | 'facebook' | 'native'

export type PlatformShareTargets = {
    email: string
    sms: string
    linkedin: string
    facebook: string
}

export function platformShareTargets(url: string, subject: string, message: string): PlatformShareTargets {
    const body = `${message}\n\n${url}`
    const link = encodeURIComponent(url)

    return {
        email: `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
        // `?&body=` is the form both iOS and Android read.
        sms: `sms:?&body=${encodeURIComponent(body)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${link}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${link}`,
    }
}

/** The share code a signup link carries, or null. Codes are lower case; people retype them. */
export function shareCodeFromQuery(search: string): string | null {
    const code = new URLSearchParams(search).get('share')?.trim().toLowerCase() ?? ''

    return /^[a-z0-9]{4,32}$/.test(code) ? code : null
}
