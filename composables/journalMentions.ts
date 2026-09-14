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

// Every note mounts its own JournalMentionContent, all in the same tick, so
// calls are merged into one request instead of firing one per note.
let batch = new Set<string>()
let batchPromise: Promise<void> | null = null

export function useJournalMentions() {
    async function resolveCitizens(uuids: string[]): Promise<Map<string, ResolvedCitizenMention>> {
        const missing = uuids.filter((uuid) => uuid && !cache.has(uuid))

        if (missing.length) {
            missing.forEach((uuid) => batch.add(uuid))

            if (!batchPromise) {
                batchPromise = flushBatch()
            }

            await batchPromise
        }

        return cache
    }

    async function flushBatch(): Promise<void> {
        // Let every call still in this tick add its uuids before we read the batch.
        await Promise.resolve()

        const uuids = [...batch]

        batch = new Set()
        batchPromise = null

        if (!uuids.length) {
            return
        }

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
