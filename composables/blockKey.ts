/**
 * A key for a template block that stays with the block, not with its place in
 * the list. Keyed by position, moving a block into a group left each position's
 * pickers showing the previous block's choice (another block read "Goal"
 * instead of "No group").
 *
 * Kept beside the block rather than on it: the block JSON is saved as it is,
 * so a key property would end up in every template.
 */
const keys = new WeakMap<object, string>()
let next = 0

export function blockKey(block: object): string {
    let key = keys.get(block)

    if (!key) {
        key = `block-${++next}`
        keys.set(block, key)
    }

    return key
}
