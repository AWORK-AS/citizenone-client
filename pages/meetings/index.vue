<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('meetings.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('meetings.title') }}</template>

            <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div class="inline-flex rounded-md border border-gray-200 bg-white p-1">
                    <button v-for="scope in (['upcoming', 'past'] as const)" :key="scope" type="button"
                        class="px-3 py-1.5 text-sm rounded"
                        :class="state.scope === scope ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-50'"
                        @click="changeScope(scope)">
                        {{ $t(`meetings.${scope}`) }}
                    </button>
                </div>
                <FormButton type="button" buttonStyle="primary" @click="navigateTo('/meetings/create')">
                    <Icon name="ph:plus" class="h-4 w-4 mr-1" /> {{ $t('meetings.newMeeting') }}
                </FormButton>
            </div>

            <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />

            <LoadingSpinner :isActive="state.isLoading">
                <div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg divide-y divide-gray-100">
                    <p v-if="!state.meetings.length" class="p-6 text-sm text-gray-500">{{ $t('meetings.noMeetings') }}</p>
                    <NuxtLink v-for="meeting in state.meetings" :key="meeting.uuid" :to="`/meetings/${meeting.uuid}`"
                        class="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 hover:bg-gray-50">
                        <div class="w-36 shrink-0 text-sm">
                            <p class="font-semibold">{{ formatDate(meeting.starts_at) }}</p>
                            <p class="text-gray-500">{{ formatTime(meeting.starts_at) }}-{{ formatTime(meeting.ends_at) }}</p>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="font-medium truncate">{{ meeting.title }}</p>
                            <p class="text-sm text-gray-500 truncate">
                                {{ meeting.is_host ? $t('meetings.you') : meeting.host?.name }}
                                · {{ meeting.participants?.length ?? 0 }} {{ $t('meetings.detail.participants').toLowerCase() }}
                            </p>
                        </div>
                        <span class="text-xs rounded-full px-2 py-0.5" :class="statusClass(meeting.status)">
                            {{ $t(`meetings.status.${meeting.status}`) }}
                        </span>
                        <Icon v-if="meeting.ready_recordings_count" name="ph:record" class="h-4 w-4 text-red-600"
                            :title="$t('meetings.detail.recordings')" />
                    </NuxtLink>
                </div>
                <div class="mt-4 flex justify-center gap-2" v-if="state.lastPage > 1">
                    <FormButton type="button" buttonStyle="cancel" :disabled="state.page <= 1" @click="load(state.page - 1)">‹</FormButton>
                    <span class="self-center text-sm">{{ state.page }} / {{ state.lastPage }}</span>
                    <FormButton type="button" buttonStyle="cancel" :disabled="state.page >= state.lastPage" @click="load(state.page + 1)">›</FormButton>
                </div>
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'require-application', requiredApplication: 'meetings_enabled' })

import moment from 'moment'
import { meetingService } from '@/components/api/user/MeetingService'

const runtimeConfig = useRuntimeConfig()

const state = reactive({
    scope: 'upcoming' as 'upcoming' | 'past',
    meetings: [] as any[],
    page: 1,
    lastPage: 1,
    isLoading: false,
    error: {} as any,
})

onMounted(() => load(1))

async function load(page: number) {
    state.isLoading = true
    state.error = {}
    try {
        const response = await meetingService.list({ scope: state.scope, page })
        state.meetings = response?.data ?? []
        state.page = response?.meta?.current_page ?? page
        state.lastPage = response?.meta?.last_page ?? 1
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function changeScope(scope: 'upcoming' | 'past') {
    state.scope = scope
    load(1)
}

const formatDate = (value: string) => moment(value).format('DD-MM-YYYY')
const formatTime = (value: string) => moment(value).format('HH:mm')

function statusClass(status: string) {
    return {
        scheduled: 'bg-blue-50 text-blue-700',
        live: 'bg-green-50 text-green-700',
        finished: 'bg-gray-100 text-gray-600',
        cancelled: 'bg-red-50 text-red-700',
    }[status] ?? 'bg-gray-100 text-gray-600'
}
</script>
