<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <h3 class="text-sm font-medium pr-6">{{ $t('dailyOverview.poll') }}</h3>
        <div class="mt-4 text-sm space-y-2 divide-y overflow-scroll min-h-44 max-h-96 pr-6">
            <div v-for="(poll, index) in state.polls?.data" :key="index" class="p-2 flex justify-between items-center">
                <div>
                    <h3 class="text-md font-semibold">
                        {{ poll?.feature }}
                    </h3>
                    <p class="text-xs text-muted-400">
                        <span>{{ formatDateToReadable(poll?.created_at) }}</span>
                    </p>
                </div>
                <Icon name="ph:thumbs-up" class="h-5 w-5 cursor-pointer" aria-hidden="true" @click="addVote(poll)" />
            </div>
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import moment from 'moment'
import { dailyOverviewService } from '@/components/api/DailyOverviewService'
import type { Error } from '@/types'

const state = reactive({
    isPageLoading: false,
    error: {} as Error,
    polls: [] as any,
})

onMounted(() => {
    fetchPolls()
})

async function fetchPolls() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await dailyOverviewService.getPolls()
        if (response) {
            state.polls = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function addVote(poll: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            poll_uuid: poll?.uuid
        }
        const response = await dailyOverviewService.saveVote(params)
        if (response) {
            state.polls = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function deleteVote(poll: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const pollUuid = poll?.uuid
        const response = await dailyOverviewService.deleteVote(pollUuid)
        if (response) {
            state.polls = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function formatDateToReadable(datetime: string) {
    return moment(datetime).format('DD MMM, YYYY')
}
</script>