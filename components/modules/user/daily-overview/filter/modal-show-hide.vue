<template>
    <div>
        <Modal size="sm" :title="$t('overview.filter.chooseWhatToDisplay')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <LoadingSpinner :isActive="state.isPageLoading">
                    <p v-if="layoutIsLocked" class="mb-4 flex items-start gap-x-2 rounded-lg bg-primary-25 px-3 py-2 text-xs text-slate-600">
                        <Icon name="ph:lock-simple" class="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                        {{ $t('dailyOverviewLayouts.managedByAdmin') }}
                    </p>
                    <div class="space-y-3">
                        <template v-for="item in visibleItems" :key="item.key">
                            <div v-if="isMandatory(item.key)" class="w-fit flex items-center text-sm text-slate-500"
                                :title="$t('dailyOverviewLayouts.requiredByAdmin')">
                                <FormCheckbox :value="true" />
                                {{ item.label }}
                                <Icon name="ph:lock-simple" class="ml-1.5 h-3.5 w-3.5 text-slate-400"
                                    :aria-label="$t('dailyOverviewLayouts.requiredByAdmin')" />
                            </div>
                            <div v-else class="w-fit flex items-center cursor-pointer text-sm" @click="toggle(item.key)">
                                <FormCheckbox :value="isChecked(item.key)" />
                                {{ item.label }}
                            </div>
                        </template>
                    </div>
                    <div class="mt-5 flex gap-x-3 justify-end">
                        <FormButton buttonStyle="primary" @click="closeModal">
                            {{ $t('close') }}
                        </FormButton>
                    </div>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { dailyOverviewService } from '@/components/api/user/DailyOverviewService'
import { useDailyOverviewStore } from '@/store/daily-overview'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useUserStore } from '@/store/user'
import { useDailyOverviewLayout } from '@/composables/useDailyOverviewLayout'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const dailyOverviewStore = useDailyOverviewStore() as any
const customPagesStore = useCustomPagesStore() as any
const userStore = useUserStore() as any
const { t } = useI18n()
const { isLocked: layoutIsLocked, isMandatory, isHidden, customBoxes } = useDailyOverviewLayout()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
})

/**
 * Every flag in daily_overview_filter, in the order the list shows them. The
 * same modal serves the Daily Overview and the Statistics page, so both pages'
 * flags are here; an admin layout only ever applies to the Daily Overview ones.
 */
const FILTER_ITEMS = computed(() => [
    { key: 'showCitizensDailyEvents', label: t('overview.filter.items.citizensEvents') },
    { key: 'showLatestJournal', label: t('overview.filter.items.latestJournal') },
    { key: 'showDailyMedicineOverview', label: t('overview.filter.items.medicationOverview') },
    { key: 'showCitizensFollowUpReminders', label: t('overview.filter.items.citizensFollowUpReminders') },
    { key: 'showTreatments', label: t('overview.filter.items.treatments') },
    { key: 'showMyDailyEvents', label: t('overview.filter.items.calendar') },
    { key: 'showBulletBoard', label: t('overview.filter.items.bulletBoard') },
    { key: 'showCitizensAdmissionAndDischarged', label: t('overview.filter.items.citizensAdmissionAndDischarged') },
    { key: 'showCitizensOrigin', label: t('overview.filter.items.citizensOrigin') },
    { key: 'showCitizensAddictions', label: t('overview.filter.items.citizensAddictions') },
    { key: 'showCitizensDiagnoses', label: t('overview.filter.items.citizensDiagnoses') },
    { key: 'showRiskAssessment', label: customPagesStore.getCustomPagesName?.riskAssessment },
    { key: 'showGender', label: t('overview.filter.items.gender') },
    { key: 'showStatusesScoreStatistics', label: t('overview.filter.items.statusesStatistics') },
    { key: 'showGoalsScoreStatistics', label: t('overview.filter.items.goalsStatistics') },
    { key: 'showIncidentStatistics', label: t('overview.filter.items.incidentStatistics') },
    { key: 'showMedicineDeviationStatistics', label: t('overview.filter.items.medicineDeviationStatistics') },
    { key: 'showJournalScoreStatistics', label: t('overview.filter.items.journalStatistics') },
    { key: 'showSubgoalsScoreStatistics', label: t('overview.filter.items.subgoalsStatistics') },
    ...(userStore.getUser?.company?.onboarding_preferences?.modules?.useOfForce !== false
        ? [{ key: 'showUseOfForceStatistics', label: t('overview.filter.items.useOfForceStatistics') }]
        : []),
    { key: 'showScheduleSlots', label: t('overview.filter.items.scheduleSlots') },
    { key: 'showPlansAndGoals', label: t('overview.filter.items.plansAndGoals') },
    { key: 'showReminders', label: t('reminders.reminders') },
])

/** The fixed list, minus what the admin hid, plus the admin's custom boxes. */
const visibleItems = computed(() => [
    ...FILTER_ITEMS.value.filter((item) => !isHidden(item.key)),
    ...customBoxes.value
        .filter((box: any) => box.state !== 'hidden')
        .map((box: any) => ({ key: box.key, label: box.title })),
])

function isChecked(key: string): boolean {
    const value = dailyOverviewStore.getDailyOverviewFilter?.[key]
    return key.startsWith('custom:') ? value !== false : !!value
}

watch(() => userStore.getUser, (user: any) => {
    if (Object.keys(user)?.length > 0) {
        const saved = JSON.parse(user?.daily_overview_filter) ?? {}
        for (const item of FILTER_ITEMS.value) {
            dailyOverviewStore.setDailyOverviewFilterFlag(item.key, saved?.[item.key])
        }
        // Reminders predate the filter, so a filter saved before it existed shows them.
        dailyOverviewStore.setDailyOverviewFilterFlag('showReminders', saved?.showReminders ?? true)
        // Personal choices about the admin's custom boxes.
        for (const key of Object.keys(saved).filter((entry) => entry.startsWith('custom:'))) {
            dailyOverviewStore.setDailyOverviewFilterFlag(key, saved[key])
        }
    }
})

function closeModal() {
    emit('close')
}

async function toggle(key: string) {
    if (isMandatory(key)) return

    state.error = {}
    state.isPageLoading = true
    try {
        const next = !isChecked(key)
        const params = {
            daily_overview_filter: { ...dailyOverviewStore.getDailyOverviewFilter, [key]: next },
        }
        const response = await dailyOverviewService.updateDailyOverviewFilter(params)
        if (response) {
            dailyOverviewStore.setDailyOverviewFilterFlag(key, next)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
