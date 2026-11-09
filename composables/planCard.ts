/**
 * What a plan card says, in the same words as the pricing on the CitizenOne homepage: the price per month (on the
 * yearly plan the yearly price spread over twelve months, with what is billed once a year), who the plan is for,
 * and what it includes. Kept free of Vue so it can be unit tested; the card is
 * components/modules/user/subscription/plan-details.vue.
 */

export type PlanFrequency = 'monthly' | 'annually'

export interface PlanDeal {
    name?: string
    users?: number | string | null
    max_users?: number | string | null
    departments?: number | string | null
    storage_size?: string | null
    monthly_price?: number | string | null
    yearly_price?: number | string | null
    extra_users?: number | string | null
    extra_departments?: number | string | null
}

/** One line on the card: a translation key with its values, and the extra-purchase price where there is one. */
export interface PlanFeature {
    key: string
    params?: Record<string, string | number>
    /** Monthly price of one more user or department, shown as a tooltip. */
    extraPrice?: number
}

/** Basis allows up to four users in all (Deal::max_users); the deal payload does not carry it, Pro has no cap. */
const MAX_USERS_BY_PLAN: Record<string, number> = { Basis: 4 }

function toNumber(value: unknown): number {
    const number = typeof value === 'number' ? value : parseFloat(String(value ?? '').replace(',', '.'))
    return isNaN(number) ? 0 : number
}

/** The price per month: the monthly price, or on the yearly plan the yearly price over twelve months. */
export function planMonthlyPrice(deal: PlanDeal | null | undefined, frequency: PlanFrequency): number {
    if (frequency === 'annually') return Math.round(toNumber(deal?.yearly_price) / 12)
    return Math.round(toNumber(deal?.monthly_price))
}

/** What is billed once a year on the yearly plan; null on the monthly plan. */
export function planBilledYearly(deal: PlanDeal | null | undefined, frequency: PlanFrequency): number | null {
    return frequency === 'annually' ? Math.round(toNumber(deal?.yearly_price)) : null
}

/** "2.988" in Danish, Norwegian and Swedish, "2,988" in English: whole kroner, as the homepage writes them. */
export function formatWholeAmount(amount: number, locale: string): string {
    const separator = locale === 'en' ? ',' : '.'
    return String(Math.round(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, separator)
}

/** Who the plan is for, as a translation key. */
export function planTaglineKey(deal: PlanDeal | null | undefined): string {
    return deal?.name === 'Basis' ? 'subscription.plan.taglineBasis' : 'subscription.plan.taglinePro'
}

/** What the plan includes, top to bottom, as the homepage lists it. */
export function planFeatures(deal: PlanDeal | null | undefined): PlanFeature[] {
    const users = toNumber(deal?.users)
    const maxUsers = toNumber(deal?.max_users) || MAX_USERS_BY_PLAN[deal?.name ?? ''] || 0
    const departments = toNumber(deal?.departments)

    return [
        maxUsers > users
            ? { key: 'subscription.plan.usersIncludedUpTo', params: { count: users, max: maxUsers }, extraPrice: toNumber(deal?.extra_users) || undefined }
            : { key: 'subscription.plan.usersIncluded', params: { count: users }, extraPrice: toNumber(deal?.extra_users) || undefined },
        { key: 'subscription.plan.departmentsIncluded', params: { count: departments }, extraPrice: toNumber(deal?.extra_departments) || undefined },
        { key: 'subscription.plan.unlimitedCitizens' },
        { key: 'subscription.plan.storage', params: { size: deal?.storage_size ?? '' } },
        { key: 'subscription.plan.support' },
    ]
}
