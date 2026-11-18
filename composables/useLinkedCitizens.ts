import { citizenEmailService } from '@/components/api/user/CitizenEmailService'

export type LinkedCitizen = {
    source_uid: string
    citizen_uuid: string
    citizen_name: string
    case_number: string | null
}

/**
 * "Tilknyttet indsats" in the inbox (Memox 18/11): which of the loaded mails
 * this user tagged to an intervention, and to which. Asked for after each page
 * of mails and after tagging. A failed lookup only leaves the labels out; the
 * inbox itself never depends on it.
 */
export function useLinkedCitizens(sourceFolder: string) {
    const links = reactive<Record<string, LinkedCitizen[]>>({})

    async function refresh(uids: Array<string | number | null | undefined>) {
        const ids = [...new Set(uids.filter((uid) => uid !== null && uid !== undefined && uid !== '').map(String))]

        for (let i = 0; i < ids.length; i += 200) {
            const chunk = ids.slice(i, i + 200)
            try {
                const response = await citizenEmailService.getLinkedCitizens({ source_uids: chunk, source_folder: sourceFolder })
                for (const uid of chunk) delete links[uid]
                for (const row of (response?.data ?? []) as LinkedCitizen[]) {
                    (links[row.source_uid] ??= []).push(row)
                }
            } catch {
                // Labels are extra; the inbox works without them.
            }
        }
    }

    function forUid(uid: string | number | null | undefined): LinkedCitizen[] {
        return uid === null || uid === undefined ? [] : links[String(uid)] ?? []
    }

    return { refresh, forUid }
}
