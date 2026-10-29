import { useDailyOverviewStore } from '@/store/daily-overview'
import { dailyOverviewService } from '@/components/api/user/DailyOverviewService'

export type BoxState = 'mandatory' | 'optional' | 'hidden'

/**
 * The Daily Overview boxes an admin layout can control, keyed by the flag
 * they already have in a user's daily_overview_filter. The Statistics page's
 * flags share that filter; only a role layout can hide them (STATISTICS_SECTIONS).
 */
export const DAILY_OVERVIEW_BOXES = [
    { key: 'showCitizensDailyEvents', label: 'overview.filter.items.citizensEvents' },
    { key: 'showLatestJournal', label: 'overview.filter.items.latestJournal' },
    { key: 'showDailyMedicineOverview', label: 'overview.filter.items.medicationOverview' },
    { key: 'showReminders', label: 'reminders.reminders' },
    { key: 'showCitizensFollowUpReminders', label: 'overview.filter.items.citizensFollowUpReminders' },
    { key: 'showTreatments', label: 'overview.filter.items.treatments' },
    { key: 'showMyDailyEvents', label: 'overview.filter.items.calendar' },
    { key: 'showBulletBoard', label: 'overview.filter.items.bulletBoard' },
    { key: 'showScheduleSlots', label: 'overview.filter.items.scheduleSlots' },
    { key: 'showPlansAndGoals', label: 'overview.filter.items.plansAndGoals' },
    { key: 'showNextShift', label: 'overview.filter.items.nextShift' },
    { key: 'showOnDutyToday', label: 'overview.filter.items.onDutyToday' },
] as const

/** The Statistics page's sections a role layout can hide. Mirrors DailyOverviewBoxes::STATISTICS. */
export const STATISTICS_SECTIONS = [
    { key: 'showCitizensAdmissionAndDischarged', label: 'overview.filter.items.citizensAdmissionAndDischarged' },
    { key: 'showCitizensOrigin', label: 'overview.filter.items.citizensOrigin' },
    { key: 'showCitizensAddictions', label: 'overview.filter.items.citizensAddictions' },
    { key: 'showCitizensDiagnoses', label: 'overview.filter.items.citizensDiagnoses' },
    { key: 'showRiskAssessment', label: 'overview.filter.items.riskAssessment' },
    { key: 'showGender', label: 'overview.filter.items.gender' },
    { key: 'showStatusesScoreStatistics', label: 'overview.filter.items.statusesStatistics' },
    { key: 'showGoalsScoreStatistics', label: 'overview.filter.items.goalsStatistics' },
    { key: 'showIncidentStatistics', label: 'overview.filter.items.incidentStatistics' },
    { key: 'showMedicineDeviationStatistics', label: 'overview.filter.items.medicineDeviationStatistics' },
    { key: 'showJournalScoreStatistics', label: 'overview.filter.items.journalStatistics' },
    { key: 'showSubgoalsScoreStatistics', label: 'overview.filter.items.subgoalsStatistics' },
    { key: 'showUseOfForceStatistics', label: 'overview.filter.items.useOfForceStatistics' },
] as const

/**
 * Whether each Daily Overview box shows, combining the admin's layout with the
 * user's own show/hide choices:
 *
 * - no layout: the user's choice, exactly as before layouts existed
 * - mandatory: always shown, and the user cannot switch it off
 * - hidden: never shown in this department
 * - optional: the user's choice (a custom box defaults to shown)
 *
 * The server folds the user's role layouts in before it answers: whatever
 * their roles hide comes back hidden, Statistics sections included, and with
 * only role hiding in play the layout is an unsaved one where everything else
 * is the user's choice.
 */
export function useDailyOverviewLayout() {
    const store = useDailyOverviewStore() as any

    const layout = computed(() => store.getLayout)
    const isLocked = computed(() => !!layout.value?.is_locked)

    function stateOf(key: string): BoxState | null {
        if (!layout.value) return null
        if (key.startsWith('custom:')) {
            const box = (layout.value.custom_boxes ?? []).find((entry: any) => entry.key === key)
            return box?.state ?? 'hidden'
        }
        return layout.value.boxes?.[key] ?? 'optional'
    }

    function isShown(key: string): boolean {
        const state = stateOf(key)
        const personal = store.getDailyOverviewFilter?.[key]
        if (state === 'mandatory') return true
        if (state === 'hidden') return false
        if (key.startsWith('custom:')) return personal !== false
        return !!personal
    }

    function isMandatory(key: string): boolean {
        return stateOf(key) === 'mandatory'
    }

    function isHidden(key: string): boolean {
        return stateOf(key) === 'hidden'
    }

    const customBoxes = computed(() => (layout.value?.custom_boxes ?? []) as any[])
    const visibleCustomBoxes = computed(() => customBoxes.value.filter((box: any) => isShown(box.key)))

    /** Fetch the layout for the user's current department. A failure leaves the page on personal choices. */
    async function refreshLayout() {
        try {
            const response = await dailyOverviewService.getLayout()
            store.setLayout(response?.data ?? null)
        } catch {
            store.setLayout(null)
        }
    }

    return { layout, isLocked, stateOf, isShown, isMandatory, isHidden, customBoxes, visibleCustomBoxes, refreshLayout }
}
