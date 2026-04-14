<template>
    <div>
        <Modal size="sm" :title="$t('overview.filter.chooseWhatToDisplay')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="space-y-3">
                        <div class="w-fit flex items-center cursor-pointer text-sm"
                            @click="setViewAllShowCitizenDailyEvents()">
                            <FormCheckbox :value="dailyOverviewStore.getViewAllFilter.showCitizenDailyEvents" />
                            {{ $t('overview.filter.items.citizensEvents') }}
                        </div>
                        <div class="w-fit flex items-center cursor-pointer text-sm"
                            @click="setViewAllShowCitizenMedicineOverview()">
                            <FormCheckbox :value="dailyOverviewStore.getViewAllFilter.showCitizenMedicineOverview" />
                            {{ $t('overview.filter.items.medicationOverview') }}
                        </div>
                        <div class="w-fit flex items-center cursor-pointer text-sm"
                            @click="setViewAllShowLatestJournalNotes()">
                            <FormCheckbox :value="dailyOverviewStore.getViewAllFilter.showLatestJournalNotes" />
                            {{ $t('overview.filter.items.latestJournal') }}
                        </div>
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
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const dailyOverviewStore = useDailyOverviewStore()
const userStore = useUserStore() as any

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

watch(() => userStore.getUser, (user: any) => {
    if (Object.keys(user)?.length > 0) {
        dailyOverviewStore.setViewAllShowCitizenDailyEvents(JSON.parse(user?.view_all_filter)?.showCitizenDailyEvents)
        dailyOverviewStore.setViewAllShowCitizenMedicineOverview(JSON.parse(user?.view_all_filter)?.showCitizenMedicineOverview)
        dailyOverviewStore.setViewAllShowLatestJournalNotes(JSON.parse(user?.view_all_filter)?.showLatestJournalNotes)
    }
})

function closeModal() {
    emit('close')
}

async function setViewAllShowCitizenDailyEvents() {
    state.error = {}
    state.isPageLoading = true
    try {
        const viewAllFilter = {
            showCitizenDailyEvents: !dailyOverviewStore.getViewAllFilter.showCitizenDailyEvents,
            showCitizenMedicineOverview: dailyOverviewStore.getViewAllFilter.showCitizenMedicineOverview,
            showLatestJournalNotes: dailyOverviewStore.getViewAllFilter.showLatestJournalNotes
        }
        const params = {
            view_all_filter: viewAllFilter
        }
        const response = await dailyOverviewService.updateViewAllFilter(params)
        if (response) {
            dailyOverviewStore.setViewAllShowCitizenDailyEvents(!dailyOverviewStore.getViewAllFilter.showCitizenDailyEvents)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function setViewAllShowCitizenMedicineOverview() {
    state.error = {}
    state.isPageLoading = true
    try {
        const viewAllFilter = {
            showCitizenDailyEvents: dailyOverviewStore.getViewAllFilter.showCitizenDailyEvents,
            showCitizenMedicineOverview: !dailyOverviewStore.getViewAllFilter.showCitizenMedicineOverview,
            showLatestJournalNotes: dailyOverviewStore.getViewAllFilter.showLatestJournalNotes
        }
        const params = {
            view_all_filter: viewAllFilter
        }
        const response = await dailyOverviewService.updateViewAllFilter(params)
        if (response) {
            dailyOverviewStore.setViewAllShowCitizenMedicineOverview(!dailyOverviewStore.getViewAllFilter.showCitizenMedicineOverview)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function setViewAllShowLatestJournalNotes() {
    state.error = {}
    state.isPageLoading = true
    try {
        const viewAllFilter = {
            showCitizenDailyEvents: dailyOverviewStore.getViewAllFilter.showCitizenDailyEvents,
            showCitizenMedicineOverview: dailyOverviewStore.getViewAllFilter.showCitizenMedicineOverview,
            showLatestJournalNotes: !dailyOverviewStore.getViewAllFilter.showLatestJournalNotes
        }
        const params = {
            view_all_filter: viewAllFilter
        }
        const response = await dailyOverviewService.updateViewAllFilter(params)
        if (response) {
            dailyOverviewStore.setViewAllShowLatestJournalNotes(!dailyOverviewStore.getViewAllFilter.showLatestJournalNotes)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>