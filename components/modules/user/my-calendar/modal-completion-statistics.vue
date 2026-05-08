<template>
    <div>
        <Modal size="sm" :title="$t('events.completionStatistics.title')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <Alert type="danger" :text="state.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="space-y-4">
                        <div class="grid grid-cols-2 gap-3">
                            <div class="space-y-1">
                                <FormLabel for="stats_start_date" :label="$t('events.completionStatistics.startDate')" />
                                <FormDateField id="stats_start_date" name="stats_start_date" placeholder="YYYY-MM-DD"
                                    v-model="state.startDate" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="stats_end_date" :label="$t('events.completionStatistics.endDate')" />
                                <FormDateField id="stats_end_date" name="stats_end_date" placeholder="YYYY-MM-DD"
                                    v-model="state.endDate" />
                            </div>
                        </div>
                        <div>
                            <FormButton buttonStyle="primary" @click="fetchStatistics" class="w-full">
                                {{ $t('events.completionStatistics.fetchStatistics') }}
                            </FormButton>
                        </div>
                        <div v-if="state.statistics" class="space-y-3 mt-2">
                            <div class="grid grid-cols-3 gap-3 text-center">
                                <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <p class="text-2xl font-bold text-green-700">
                                        {{ state.statistics.completed ?? 0 }}
                                    </p>
                                    <p class="text-xs text-green-600 mt-1">
                                        {{ $t('events.completionStatistics.completed') }}
                                    </p>
                                </div>
                                <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p class="text-2xl font-bold text-red-700">
                                        {{ state.statistics.not_completed ?? 0 }}
                                    </p>
                                    <p class="text-xs text-red-600 mt-1">
                                        {{ $t('events.completionStatistics.notCompleted') }}
                                    </p>
                                </div>
                                <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <p class="text-2xl font-bold text-gray-700">
                                        {{ state.statistics.total ?? 0 }}
                                    </p>
                                    <p class="text-xs text-gray-500 mt-1">
                                        {{ $t('events.completionStatistics.total') }}
                                    </p>
                                </div>
                            </div>
                            <p class="text-xs text-gray-400 text-center" v-if="state.statistics.period">
                                {{ formatDateToReadable(state.statistics.period.start_date) }} – {{ formatDateToReadable(state.statistics.period.end_date) }}
                            </p>
                        </div>
                        <div v-else-if="state.hasFetched" class="text-center text-sm text-gray-500 py-4">
                            {{ $t('events.completionStatistics.noData') }}
                        </div>
                    </div>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { myCalendarService } from '@/components/api/user/MyCalendarService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import type { Error } from '@/types'

const { formatDateToReadable } = useDatetimeFormatter()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})

const emit = defineEmits(['close'])

const state = reactive({
    isPageLoading: false,
    error: {} as Error,
    startDate: moment().startOf('month').format('YYYY-MM-DD'),
    endDate: moment().endOf('month').format('YYYY-MM-DD'),
    statistics: null as any,
    hasFetched: false,
})

watch(() => props.isModalOpen, (newValue: boolean) => {
    if (newValue) {
        state.statistics = null
        state.hasFetched = false
        state.error = {}
    }
})

async function fetchStatistics() {
    state.error = {}
    state.isPageLoading = true
    state.hasFetched = false
    try {
        const params: any = {}
        if (state.startDate) params.start_date = state.startDate
        if (state.endDate) params.end_date = state.endDate

        const response = await myCalendarService.getCompletionStatistics(params)
        if (response?.data) {
            state.statistics = response.data
        } else {
            state.statistics = null
        }
        state.hasFetched = true
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function closeModal() {
    emit('close')
}
</script>
