export type RowAction = {
    key: string
    label: string
    icon: string
    run: () => void
    danger?: boolean
}

/**
 * Splits a row's actions for the "More actions" menu. Callers pass `cond && {...}`
 * for actions the user may not have, so falsy entries are dropped here; destructive
 * actions go last, in their own group, so delete is never next to edit.
 */
export function splitRowActions(items: (RowAction | false | null | undefined)[]) {
    const actions = items.filter((item): item is RowAction => Boolean(item))
    return {
        regular: actions.filter((action) => !action.danger),
        danger: actions.filter((action) => action.danger),
    }
}
