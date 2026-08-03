import { mentionService } from '@/components/api/user/MentionService'

export interface MentionFeedItem {
    // CKEditor requires an id starting with the marker.
    id: string
    // What ends up in the note: "@Name" for a colleague, initials for a citizen.
    text: string
    name: string
    uuid: string
    mentionType: 'user' | 'citizen'
    initials?: string
}

/**
 * Feed behind the @-picker. Colleagues and citizens are offered in the same
 * list, searched by their real name - a citizen is only anonymised in what
 * gets written into the note, not in what the author picks from.
 */
export async function fetchMentionFeed(term: string): Promise<MentionFeedItem[]> {
    try {
        const response = await mentionService.searchMentions({ term })
        const users = response?.data?.users ?? []
        const citizens = response?.data?.citizens ?? []

        return [
            ...users.map((user: any) => ({
                id: `@${user.name}`,
                text: user.text,
                name: user.name,
                uuid: user.uuid,
                mentionType: 'user' as const,
            })),
            ...citizens.map((citizen: any) => ({
                id: `@${citizen.name}`,
                text: citizen.text,
                name: citizen.name,
                uuid: citizen.uuid,
                initials: citizen.initials,
                mentionType: 'citizen' as const,
            })),
        ]
    } catch (error) {
        return []
    }
}

/**
 * Dropdown row: the full name is shown while picking. For a citizen we also
 * show the initials, so the author sees what will land in the note.
 */
export function renderMentionItem(item: MentionFeedItem): HTMLElement {
    const row = document.createElement('span')
    row.classList.add('co-mention-item')

    const name = document.createElement('span')
    name.classList.add('co-mention-item__name')
    name.textContent = item.name

    row.appendChild(name)

    if (item.mentionType === 'citizen') {
        const badge = document.createElement('span')
        badge.classList.add('co-mention-item__badge')
        badge.textContent = item.initials ?? ''
        row.appendChild(badge)
    }

    return row
}

/**
 * Stores a mention as
 * <span class="co-mention co-mention--user|citizen" data-mention-type data-mention-uuid>.
 *
 * The uuid is what the backend reads to notify a colleague, and what the
 * reader side resolves to a name for the tooltip. A citizen's name is never
 * written into the note itself.
 */
export function MentionCustomization(editor: any) {
    editor.conversion.for('upcast').elementToAttribute({
        view: {
            name: 'span',
            key: 'data-mention-uuid',
            attributes: {
                'data-mention-uuid': true,
                'data-mention-type': true,
            },
        },
        model: {
            key: 'mention',
            value: (viewItem: any) => editor.plugins.get('Mention').toMentionAttribute(viewItem, {
                uuid: viewItem.getAttribute('data-mention-uuid'),
                mentionType: viewItem.getAttribute('data-mention-type'),
            }),
        },
        converterPriority: 'high',
    })

    editor.conversion.for('downcast').attributeToElement({
        model: 'mention',
        view: (modelAttributeValue: any, { writer }: any) => {
            if (!modelAttributeValue?.uuid) {
                return
            }

            return writer.createAttributeElement('span', {
                class: `co-mention co-mention--${modelAttributeValue.mentionType}`,
                'data-mention-type': modelAttributeValue.mentionType,
                'data-mention-uuid': modelAttributeValue.uuid,
            }, {
                priority: 20,
                id: modelAttributeValue.uid,
            })
        },
        converterPriority: 'high',
    })
}

/**
 * Mention config shared by the journal content and note editors.
 */
export function mentionConfig() {
    return {
        dropdownLimit: 8,
        feeds: [
            {
                marker: '@',
                feed: fetchMentionFeed,
                itemRenderer: renderMentionItem,
                minimumCharacters: 0,
            },
        ],
    }
}
