import { defineStore } from 'pinia'
import { dailyOverviewService } from '@/components/api/user/DailyOverviewService'
import { useUserStore } from '@/store/user'

export interface BriefItem {
    key: string
    severity: 'critical' | 'warning' | 'info'
    count: number
    link: string
    details: Array<Record<string, string>>
}

/** The detail line: initials and times, never full names, for a screen read in a shared room. */
export function describeBriefItem(item: BriefItem): string {
    return (item.details ?? [])
        .map((detail) => [detail.initials, detail.name, detail.time].filter(Boolean).join(' '))
        .join(' · ')
}

// A brief younger than this is reused rather than fetched again, so the topbar
// and My day mounting together cost one request, not two. Opening the panel
// always refetches: that is when the list has to be right.
const BRIEF_MAX_AGE_MS = 60_000

let briefRequest: Promise<void> | null = null

/**
 * Open/closed state for the assistant panel.
 *
 * The assistant used to be a modal opened from a button in the navbar, which
 * meant it covered the page you were asking about. It is now a panel rendered
 * once by the user layout, so the state has to live outside both the button and
 * the panel - the layout also needs it to make room for the panel on wide
 * screens.
 */
export const useAssistantStore = defineStore('assistantStore', {
    // Only whether the panel is open survives a reload. The insert target
    // belongs to a form that is open right now, and a stored one would offer to
    // insert into something that is not there any more.
    persist: { paths: ['isOpen', 'isCollapsed'] },
    state: () => ({
        isOpen: false,
        // Rolled down to its header, keeping the conversation. Persisted with
        // isOpen: someone who parked Cody at the bottom of the screen meant it
        // to stay parked, not to spring open on the next page.
        isCollapsed: false,
        // A form that can receive an answer registers itself here while it is
        // open, which is what turns the "insert" action on in the panel. The
        // panel has no reference to the editor and does not need one.
        insertTargetLabel: null as string | null,
        pendingInsert: null as string | null,
        // A question handed to the panel from somewhere else on the page. The
        // panel picks it up, asks it and clears it. Not persisted: a question
        // that survives a reload would fire without anyone asking for it.
        pendingQuestion: null as string | null,
        // What needs this user's attention today, from /user/daily-brief. Held
        // here because three places show it - the count on the topbar button,
        // the list in the panel and My day - and a count that disagrees with
        // the list under it is worse than no count. Not persisted: a brief from
        // yesterday's session is exactly the stale number the badge must not show.
        brief: [] as BriefItem[],
        briefLoadedAt: 0,
        // Whose brief this is. A logout is not a page load, so without this a
        // colleague signing in on the same screen within the minute would be
        // shown the previous user's list.
        briefOwner: null as string | null,
    }),
    getters: {
        // Things, not categories: "missed_doses" with a count of 2 is two.
        waitingCount: (state) => state.brief.reduce((total, item) => total + (Number(item?.count) || 0), 0),
    },
    actions: {
        /**
         * Fetch the brief, unless a fresh one is already here or on its way.
         *
         * Quiet on failure: a count is worth having when it is right and worth
         * nothing when it is wrong, so a failed request empties it rather than
         * leaving an old number up.
         */
        async loadBrief(force = false) {
            const owner = (useUserStore() as any).getUser?.uuid ?? null

            if (owner !== this.briefOwner) {
                this.brief = []
                this.briefLoadedAt = 0
                this.briefOwner = owner
            }

            if (!force && this.briefLoadedAt && Date.now() - this.briefLoadedAt < BRIEF_MAX_AGE_MS) return
            if (briefRequest) return briefRequest

            briefRequest = (async () => {
                try {
                    const response = await dailyOverviewService.getDailyBrief()
                    // Someone else may have signed in while this was on its way.
                    if (this.briefOwner !== owner) return
                    this.brief = response?.data?.items ?? response?.items ?? []
                    this.briefLoadedAt = Date.now()
                } catch {
                    this.brief = []
                    this.briefLoadedAt = 0
                } finally {
                    briefRequest = null
                }
            })()

            return briefRequest
        },
        open() {
            this.isOpen = true
            this.isCollapsed = false
        },
        close() {
            this.isOpen = false
        },
        toggle() {
            // Open but rolled down counts as closed to anyone pressing the
            // button: they want to see it, so unroll it rather than hide it.
            if (this.isOpen && this.isCollapsed) {
                this.isCollapsed = false

                return
            }

            this.isOpen = !this.isOpen
        },
        toggleCollapsed() {
            this.isCollapsed = !this.isCollapsed
        },
        /**
         * Open the panel with a question already asked.
         *
         * The point is that the rest of the product can hand Cody something it
         * is already showing. A page that lists "two doses are unregistered"
         * should be able to ask about them without the reader typing the
         * sentence out again.
         */
        askAbout(question: string) {
            this.pendingQuestion = question
            this.isOpen = true
            this.isCollapsed = false
        },
        questionHandled() {
            this.pendingQuestion = null
        },
        offerInsertTarget(label: string) {
            this.insertTargetLabel = label
        },
        withdrawInsertTarget() {
            this.insertTargetLabel = null
            this.pendingInsert = null
        },
        requestInsert(html: string) {
            this.pendingInsert = html
        },
        insertHandled() {
            this.pendingInsert = null
        },
    },
})
