import { useI18n } from 'vue-i18n'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useUserStore } from '@/store/user'

/**
 * One price, worked out once.
 *
 * The same app used to be priced in three places - the store card, the details
 * modal and the superadmin list - each with its own arithmetic, so a card could
 * show a different number from the page it opened. Everything that shows a price
 * now reads it from here.
 *
 * The shape is deliberately flat: a headline the eye lands on, and the rest as
 * notes under it. An app sold as a base plus a price per unit leads with the
 * base, because that is what the company pays before it adds anybody.
 */
export interface AppPrice {
    isFree: boolean
    amount: number
    /** '/md.' or '/år', empty for a one-off. */
    unit: string
    /** 'pr. bruger', 'pr. borger', … when the app is billed per seat. */
    per: string
    /** Extra lines: a base fee, a setup fee. */
    notes: string[]
    hasDiscount: boolean
    discountPercent: number
    discountedAmount: number
    /** Days until the offer ends, null when there is no offer. */
    daysLeft: number | null
}

export function useAppPrice() {
    const { t } = useI18n()
    const { formatAmount } = useAmountFormatter()
    const userStore = useUserStore() as any

    const billedYearly = () =>
        ['yearly', 'custom_yearly'].includes(userStore.getUser?.user_subscription?.type)

    function appPrice(app: any): AppPrice {
        const yearly = billedYearly()
        const oneOff = !!app?.is_one_time_fee

        const seatPrice = oneOff
            ? Number(app?.price) || 0
            : Number(yearly ? app?.yearly_price : app?.monthly_price) || 0

        const basePrice = oneOff
            ? 0
            : Number(yearly ? app?.base_yearly_price : app?.base_monthly_price) || 0

        const headline = basePrice > 0 ? basePrice : seatPrice

        const notes: string[] = []
        if (basePrice > 0) {
            notes.push(`+ ${formatAmount(seatPrice)} ${t('apps.perUserSuffix')}`)
        }
        if (Number(app?.setup_fee) > 0) {
            notes.push(`+ ${formatAmount(app.setup_fee)} ${t('apps.setupFeeSuffix')}`)
        }

        const percent = Math.round(Number(app?.discount_percent) || 0)
        const hasDiscount = !!app?.has_active_discount && percent > 0

        return {
            isFree: !!app?.is_free || headline === 0,
            amount: headline,
            unit: oneOff ? '' : yearly ? t('apps.year') : t('apps.month'),
            per: app?.is_quantifiable && basePrice === 0 ? t('apps.perUserSuffix') : '',
            notes,
            hasDiscount,
            discountPercent: percent,
            discountedAmount: hasDiscount ? Math.round(headline * (1 - percent / 100)) : headline,
            daysLeft: daysUntil(app?.discount_ends_at),
        }
    }

    function daysUntil(endsAt: any): number | null {
        if (!endsAt) return null
        const end = new Date(endsAt)
        if (isNaN(end.getTime())) return null
        const diff = end.getTime() - Date.now()
        return diff <= 0 ? 0 : Math.floor(diff / 86400000)
    }

    return { appPrice, formatAmount }
}

/**
 * The one badge an app card carries, in the order that matters to somebody
 * standing in the store: what they already own, then what is cheap now, then
 * what is new, then what everybody else picked. Five badges at once said
 * nothing; one says the most useful thing.
 */
export function appBadgeFor(app: any): { key: string; tone: string } | null {
    if (app?.user_activated) return { key: 'apps.activated', tone: 'owned' }
    if (app?.has_active_discount && Number(app?.discount_percent) > 0) {
        return { key: 'apps.badge.discount', tone: 'offer' }
    }
    if (app?.is_news) return { key: 'apps.badge.news', tone: 'new' }
    if (app?.is_popular) return { key: 'apps.badge.popular', tone: 'popular' }
    if (app?.is_recommended) return { key: 'apps.badge.recommended', tone: 'recommended' }
    if (app?.is_thirdparty) return { key: 'apps.thirdPartyApp', tone: 'partner' }
    return null
}
