<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <h3 class="text-sm font-medium pr-6">{{ $t('dailyOverview.poll') }}</h3>
        <div class="mt-4 text-sm space-y-2 divide-y overflow-scroll min-h-44 max-h-96 pr-5 mr-1">
            <div v-for="(poll, pollIndex) in state.polls?.data" :key="pollIndex" class="py-2">
                <div>
                    <h3 class="font-semibold">
                        {{ poll?.title }}
                    </h3>
                    <div class="space-y-2 divide-y divide-dashed px-2">
                        <div class="pt-2" v-for="(item, itemIndex) in poll.items" :key="itemIndex">
                            <div class="flex justify-between items-center">
                                <div>
                                    <h3 class="text-md">
                                        {{ item?.title }}
                                    </h3>
                                    <p class="text-xxs text-muted-400">
                                        <span>{{ formatDateToReadable(item?.created_at) }}</span>
                                    </p>
                                </div>
                                <div class="flex items-center gap-x-2">
                                    <p>
                                        {{ item?.vote_count }}
                                    </p>
                                    <Icon name="carbon:thumbs-up-filled" class="h-5 w-5 bg-tertiary cursor-pointer"
                                        aria-hidden="true" @click="deleteVote(pollIndex, itemIndex, item)"
                                        v-if="item?.user_voted" />
                                    <Icon name="carbon:thumbs-up" class="h-5 w-5 cursor-pointer" aria-hidden="true"
                                        @click="addVote(pollIndex, itemIndex, item)" v-else />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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

async function addVote(pollIndex: number, itemIndex: number, pollItem: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            pollitem_uuid: pollItem?.uuid
        }
        const response = await dailyOverviewService.saveVote(params)
        if (response) {
            state.polls.data[pollIndex].items[itemIndex].user_voted = true
            state.polls.data[pollIndex].items[itemIndex].vote_count = parseInt(state.polls.data[pollIndex].items[itemIndex].vote_count) + 1
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function deleteVote(pollIndex: number, itemIndex: number, pollItem: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const pollItemUuid = pollItem?.uuid
        const response = await dailyOverviewService.deleteVote(pollItemUuid)
        if (response) {
            state.polls.data[pollIndex].items[itemIndex].user_voted = false
            state.polls.data[pollIndex].items[itemIndex].vote_count = parseInt(state.polls.data[pollIndex].items[itemIndex].vote_count) - 1
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