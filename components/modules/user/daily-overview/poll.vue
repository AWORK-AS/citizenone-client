<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <Alert type="danger"
            :text="state?.error?.message === 'You have already voted.' ? `${$t('poll.youHaveAlreadyVoted')}.` : state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <h3 class="text-primary text-base font-medium py-2">
            {{ $t('overview.poll.poll') }}
        </h3>

        <div class="border-2 border-gray-300 border-dashed rounded-md flex items-center justify-center h-80 text-sm mt-10"
            v-if="state.polls?.data?.length === 0">
            {{ $t('overview.poll.noPollToShow') }}
        </div>

        <div class="mt-3 text-sm space-y-2 overflow-scroll min-h-44 max-h-96 pr-4 mr-1" v-else>
            <div v-for="(poll, pollIndex) in state.polls?.data" :key="pollIndex">
                <div class="space-y-3 px-2">
                    <div class="flex items-center gap-x-2">
                        <div class="w-3 h-3 rounded-full bg-secondary"></div>
                        <h3 class="font-semibold w-fit">
                            {{ poll?.title }}
                        </h3>
                    </div>
                    <div class="space-y-3 pb-2">
                        <div v-for="(item, itemIndex) in poll.items" :key="itemIndex">
                            <div
                                class="bg-white ring-1 ring-gray-200 shadow-sm rounded-md px-4 py-5 border-l-8 border-secondary">
                                <div class="flex justify-between items-center">
                                    <div class="space-y-1">
                                        <h3 class="text-base font-semibold">
                                            {{ item?.title }}
                                        </h3>
                                        <p class="text-xs">
                                            {{ item?.description }}
                                        </p>
                                        <p class="text-xs">
                                            {{ $t('overview.poll.sentBy') }}
                                            {{ item?.sender }}
                                            <span class="lowercase">{{ $t('overview.poll.from') }}</span>
                                            {{ item?.region?.name }}
                                        </p>
                                        <p class="text-xxs text-muted-400">
                                            <span>{{ formatDateToReadable(item?.created_at) }}</span>
                                        </p>
                                    </div>
                                    <div class="flex items-center gap-x-2">
                                        <p>
                                            {{ item?.vote_count }}
                                        </p>
                                        <Icon name="carbon:thumbs-up-filled"
                                            class="h-5 w-5 bg-tertiary cursor-pointer hover:bg-tertiary"
                                            aria-hidden="true" @click="deleteVote(pollIndex, itemIndex, item)"
                                            v-if="item?.user_voted" />
                                        <Icon name="carbon:thumbs-up" class="h-5 w-5 cursor-pointer hover:bg-tertiary"
                                            aria-hidden="true" @click="addVote(pollIndex, itemIndex, item)" v-else />
                                    </div>
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
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { dailyOverviewService } from '@/components/api/user/DailyOverviewService'
import type { Error } from '@/types'

const { formatDateToReadable } = useDatetimeFormatter()

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
        fetchPolls()
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
</script>