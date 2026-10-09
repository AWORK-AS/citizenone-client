import { useUserStore } from '@/store/user'

// The first citizen tab the signed-in user may open, Journals first. Used
// wherever a citizen's name links to "the citizen" (global search, the chat
// header) so both land on the same page. `/citizens` means none of the tabs.
export function useCitizenFirstPage() {
    const userStore = useUserStore() as any

    function getFirstCitizenPage(citizenUuid: string): string {
        const pages: any[] = userStore.getUser?.pages ?? []
        const has = (name: string) => pages.some((p: any) => p.name === name)
        if (has('Journals')) return `/citizens/${citizenUuid}/journals`
        if (has('Medicine card')) return `/citizens/${citizenUuid}/medicine-journals`
        if (has('Plans and goals')) return `/citizens/${citizenUuid}/plans-and-goals/all`
        if (has('Health')) return `/citizens/${citizenUuid}/nursing-areas`
        if (has('Documents')) return `/citizens/${citizenUuid}/documents`
        if (has('Attendance')) return `/citizens/${citizenUuid}/attendance`
        if (has('Calendar')) return `/citizens/${citizenUuid}/calendar`
        if (has('Economy')) return `/citizens/${citizenUuid}/wallets`
        if (has('Contacts')) return `/citizens/${citizenUuid}/contacts`
        if (has('Employee Group')) return `/citizens/${citizenUuid}/employee-groups`
        return `/citizens`
    }

    return { getFirstCitizenPage }
}
