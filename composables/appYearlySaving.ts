/**
 * What yearly billing gives compared with paying every month, worked out from the
 * app's own monthly and yearly price. The store page shows it under the prices, so
 * the figures follow the prices whenever they are changed in superadmin, instead of
 * living in a description text that nobody remembers to update.
 *
 * Null when there is nothing to show: a one-off price, a missing price, or a yearly
 * price that is not cheaper than twelve months.
 */
export interface YearlySaving {
    /** The yearly price spread over twelve months. */
    perMonth: number
    /** Twelve monthly payments minus the yearly price. */
    amount: number
    /** The saving as a whole percent of twelve monthly payments, rounded to one decimal. */
    percent: number
}

const round2 = (n: number) => Math.round(n * 100) / 100

export function yearlySaving(app: any): YearlySaving | null {
    if (!app || app.is_one_time_fee || app.is_free) return null
    const monthly = Number(app.monthly_price) || 0
    const yearly = Number(app.yearly_price) || 0
    if (monthly <= 0 || yearly <= 0) return null

    const twelve = monthly * 12
    const amount = round2(twelve - yearly)
    if (amount <= 0) return null

    return {
        perMonth: round2(yearly / 12),
        amount,
        percent: Math.round((amount / twelve) * 1000) / 10,
    }
}
