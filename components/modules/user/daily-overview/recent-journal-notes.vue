<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <div class="p-5" v-if="state.journals?.data?.length === 0">
            <div
                class="border-2 border-gray-300 border-dashed rounded-md flex items-center justify-center min-h-80 max-h-80 text-sm mt-2">
                {{ $t('overview.noJournalsToShow') }}
            </div>
        </div>

        <div class="text-sm divide-y overflow-scroll min-h-96 max-h-96 px-5 py-4" v-else>
            <div v-for="(journal, index) in state.journals?.data" :key="index"
                class="pl-4 pr-3 py-5 cursor-pointer hover:bg-gray-50"
                @click="navigateTo(`/citizens/${journal?.citizen?.uuid}/journals`)">
                <div class="flex gap-x-2">
                    <img :src="journal?.citizen?.image ?? avatarUrl(`${journal?.citizen?.firstname + ' ' + (journal?.citizen?.lastname ?? '')}`)"
                        :class="[
                            riskBorderClass(journal?.assessment),
                            'rounded-full w-12 h-12 object-cover border-2'
                        ]" />
                    <div class="min-w-0">
                        <p class="text-sm font-medium text-primary">
                            {{ journal?.citizen?.firstname + ' ' + (journal?.citizen?.lastname ?? '') }}
                        </p>
                        <p class="text-xxs" v-if="journal?.user?.firstname && journal?.user?.lastname">
                            {{ $t('overview.createdBy') }}
                            {{ journal?.user?.firstname + ' ' + (journal?.user?.lastname ?? '') }}
                        </p>
                        <div class="px-1">
                            <h3 class="text-base font-semibold">
                                {{ journal?.title }}
                            </h3>
                            <div v-html="journal?.content" class="text-sm" />
                            <!-- Date the note applies to, plus the time it was
                                 written - staff read the feed chronologically and
                                 the day alone is not enough to tell two notes apart. -->
                            <p class="content text-xs text-muted-400 mt-1">
                                <span>{{ formatDateToReadable(journal?.date) }}</span>
                                <span v-if="journal?.created_at"> · {{ formatTimeToReadable(journal.created_at) }}</span>
                            </p>
                        </div>
                        <p class="text-xs ml-1" v-if="journal?.score">
                            {{ $t('overview.latestJournal.score') }}:
                            {{ journal?.score }}
                        </p>
                    </div>
                </div>
            </div>

            <div class="pt-4 text-center" v-if="remaining > 0">
                <button class="text-sm text-primary hover:text-primary-700" @click="navigateTo(seeAllPath)">
                    {{ $t('overview.recentJournalNotes.more', { count: remaining }) }}
                </button>
            </div>
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { recentJournalWindow } from '@/composables/recentJournalWindow'
import { journalService } from '@/components/api/user/JournalService'
import { useDepartmentStore } from '@/store/department'
import type { Error } from '@/types'

const props = defineProps({
    /** How far back the feed reaches. Seven days is what a shift needs to catch up on. */
    days: {
        type: Number,
        required: false,
        default: 7,
    },
})

const emit = defineEmits(['total'])

const departmentStore = useDepartmentStore()
const { formatDateToReadable, formatTimeToReadable } = useDatetimeFormatter()

const state = reactive({
    isPageLoading: false,
    journals: [] as any,
    error: {} as Error,
})

const dateRange = computed(() => recentJournalWindow(props.days))

const seeAllPath = computed(() =>
    `/journal-notes?start_date=${dateRange.value.start_date}&end_date=${dateRange.value.end_date}`)

const remaining = computed(() => {
    const total = state.journals?.meta?.total ?? 0
    const shown = state.journals?.data?.length ?? 0
    return total - shown
})

function riskBorderClass(assessment: string | null): string {
    if (assessment === 'no risk') return 'border-green-700'
    if (assessment === 'increased risk') return 'border-yellow-500'
    if (assessment === 'acute increased risk') return 'border-red-600'
    return 'border-secondary'
}

watch(() => departmentStore.getSelectedDepartmentName, (newValue: any) => {
    if (newValue != null) {
        fetchRecentJournals()
    }
})

onMounted(() => {
    fetchRecentJournals()
})

async function fetchRecentJournals() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params: any = {
            page: 1,
            sort_field: 'date',
            sort_order: 'desc',
            department: departmentStore.getSelectedDepartmentName,
            start_date: dateRange.value.start_date,
            end_date: dateRange.value.end_date,
        }
        const response = await journalService.getJournalsOverview(params)
        if (response) {
            state.journals = response
            emit('total', response?.meta?.total ?? response?.data?.length ?? 0)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
