/**
 * Pure helpers for the billing extraction (Faktureringsudtræk). Free of Vue
 * and auto-imports so they can be tested with
 * `node --test tests/unit/socialBilling.test.mjs`.
 */

type Span = { from: string, to: string }

/**
 * The dates the invoice really covers: the earliest and latest date of what is
 * still to bill in the group (rows with hours, and contract lines not yet
 * billed). An earlier month that was never billed, or a period billed in
 * advance, widens it. Without anything dated it is the chosen window.
 */
export function billedSpan(group: any, fallbackFrom: string, fallbackTo: string): Span {
    const dates: string[] = []

    for (const row of group?.rows ?? []) {
        if (Number(row.used_hours ?? 0) > 0) {
            dates.push(row.period_from, row.period_to)
        }

        for (const line of row.contract_lines ?? []) {
            if (!line.is_billed) {
                dates.push(line.period_from, line.period_to)
            }
        }
    }

    // ISO dates (yyyy-mm-dd) sort as text.
    const valid = dates.filter((date) => typeof date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(date)).sort()

    if (!valid.length) {
        return { from: fallbackFrom, to: fallbackTo }
    }

    return { from: valid[0].slice(0, 10), to: valid[valid.length - 1].slice(0, 10) }
}

/**
 * What is sent to the extraction: the optional billing filters only when one
 * is chosen, so a request without them is exactly as before.
 */
export function extractionParams(filter: Record<string, any>): Record<string, any> {
    const params: Record<string, any> = {
        from_date: filter.from_date,
        to_date: filter.to_date,
        group_by: filter.group_by,
    }

    if (filter.billing_timing) params.billing_timing = filter.billing_timing
    if (filter.billing_frequency) params.billing_frequency = filter.billing_frequency

    return params
}

/** The invoices the delete action can take: unsent and never transferred. */
export function deletableInvoices(invoices: any[]): any[] {
    return (invoices ?? []).filter((invoice: any) => invoice?.is_deletable === true)
}
