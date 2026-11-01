// The first question on /register: "What do you do?"
//
// The form used to open on name, e-mail and password, and then ask for the
// industry in an alphabetical dropdown of 59, where "Afspændingsterapeut" came
// first and a dentist had to scroll to "T". Now the visitor answers one easy
// question with five big answers first, before giving anything personal, and
// the rest of the signup speaks their language from there.
//
// The five buckets are the backend's IndustryDefaults::profile(), sent on every
// industry as `profile`, so the signup and the product the visitor lands in can
// not disagree about what kind of practice they are. Beauty, teaching and an
// unknown industry have profile `default` and are found through the search.

export type SignupBucket = 'dental' | 'health' | 'therapy' | 'social_welfare' | 'employment_services'

export interface IndustryOption {
    value: string
    label: string
    system_name?: string | null
    profile?: string | null
    en_name?: string
    dk_name?: string
    no_name?: string | null
    sv_name?: string | null
}

/**
 * An industry's name in the visitor's language. Norwegian and Swedish names
 * came later and can be missing, so they fall back on the Danish one, which
 * is what those visitors saw before.
 */
export function industryLabel(industry: { en_name?: string, dk_name?: string, no_name?: string | null, sv_name?: string | null }, locale: string): string {
    if (locale === 'en') return industry.en_name ?? industry.dk_name ?? ''
    if (locale === 'no') return industry.no_name || industry.dk_name || ''
    if (locale === 'sv') return industry.sv_name || industry.dk_name || ''
    return industry.dk_name ?? industry.en_name ?? ''
}

export const BUCKETS: { key: SignupBucket, icon: string }[] = [
    { key: 'dental', icon: 'ph:tooth' },
    { key: 'health', icon: 'ph:stethoscope' },
    { key: 'therapy', icon: 'ph:hand-heart' },
    { key: 'social_welfare', icon: 'ph:house-line' },
    { key: 'employment_services', icon: 'ph:briefcase' },
]

// Shown first inside a bucket, by `en_name`, so the common answer is one click
// away and the long tail sits behind "Show all". Everything else follows by label.
const POPULAR: Partial<Record<SignupBucket, string[]>> = {
    health: ['Doctors', 'Chiropractor', 'Nurses', 'Midwife', 'Psychiatrist', 'Osteopath'],
    therapy: ['Psychologist', 'Physiotherapist', 'Psychotherapist', 'Talk therapist', 'Massage therapist', 'Coach'],
}

export const VISIBLE_BEFORE_SHOW_ALL = 6

/** `en_name` of the backend's "Other" industry (OtherIndustrySeeder): the "not on the list" answer. */
export const OTHER_INDUSTRY = 'Other'

/** The profile of an industry, falling back on the system name for an older API. */
export function profileOf(option: IndustryOption | undefined | null): string {
    return option?.profile || option?.system_name || 'default'
}

export function isBucket(profile: string): profile is SignupBucket {
    return BUCKETS.some(bucket => bucket.key === profile)
}

/** The industries in a bucket, the common ones first. */
export function industriesIn(bucket: SignupBucket, options: IndustryOption[]): IndustryOption[] {
    const popular = POPULAR[bucket] ?? []
    const rank = (option: IndustryOption) => {
        const index = popular.indexOf(option.en_name ?? '')
        return index === -1 ? popular.length : index
    }

    return options
        .filter(option => profileOf(option) === bucket)
        .sort((a, b) => rank(a) - rank(b) || a.label.localeCompare(b.label))
}

/** Case- and accent-insensitive match on both names, for the search. */
export function matchesSearch(option: IndustryOption, query: string): boolean {
    // NFD strips å and é, but ø and æ are letters of their own: map them so a
    // visitor typing "kiropraktor" on an English keyboard still finds "Kiropraktør".
    const fold = (value: string) => value.toLowerCase().replace(/ø/g, 'o').replace(/æ/g, 'ae')
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
    const needle = fold(query.trim())

    if (needle === '') return true

    return [option.label, option.dk_name, option.en_name, option.no_name, option.sv_name]
        .some(name => !!name && fold(name).includes(needle))
}
