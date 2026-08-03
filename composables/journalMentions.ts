import { mentionService } from '@/components/api/user/MentionService'

interface ResolvedCitizenMention {
    uuid: string
    name: string
    initials: string
    can_access: boolean
}

// Journal lists render many notes that tag the same people, so resolved
// citizens are cached for the page's lifetime instead of refetched per note.
const cache = new Map<string, ResolvedCitizenMention>()
const pending = new Map<string, Promise<void>>()

export function useJournalMentions() {
    async function resolveCitizens(uuids: string[]): Promise<Map<string, ResolvedCitizenMention>> {
        const missing = [...new Set(uuids)].filter((uuid) => uuid && !cache.has(uuid))

        if (missing.length) {
            const key = missing.slice().sort().join(',')

            if (!pending.has(key)) {
                pending.set(key, fetchCitizens(missing).finally(() => pending.delete(key)))
            }

            await pending.get(key)
        }

        return cache
    }

    async function fetchCitizens(uuids: string[]): Promise<void> {
        try {
            const response = await mentionService.resolveCitizenMentions(uuids)

            for (const citizen of response?.data ?? []) {
                cache.set(citizen.uuid, citizen)
            }
        } catch (error) {
            // A failed lookup must not break rendering: the note still shows
            // the initials, just without a tooltip.
        }
    }

    function citizenUuidsIn(root: HTMLElement | null): string[] {
        if (!root) {
            return []
        }

        return Array.from(root.querySelectorAll<HTMLElement>('[data-mention-type="citizen"]'))
            .map((node) => node.dataset.mentionUuid ?? '')
            .filter(Boolean)
    }

    return { resolveCitizens, citizenUuidsIn }
}
