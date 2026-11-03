<template>

    <Head>
        <Title>{{ $t('meetings.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
    </Head>

    <div class="min-h-screen bg-[#f8fafc] py-8 px-4">
        <div class="max-w-6xl mx-auto space-y-6">
            <Logo class="mx-auto" />

            <LoadingSpinner :isActive="state.isLoading">
                <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />

                <div v-if="state.info" :class="state.inRoom ? '' : 'px-4 py-6 sm:p-8 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-2xl'">
                    <MeetingRoom :connect="connect" :give-consent="giveConsent" :is-waiting="state.waiting"
                        :can-share-screen="!!state.info.can_share_screen"
                        @joined="state.inRoom = true" @left="state.inRoom = false">
                        <template #info>
                            <p class="text-sm text-gray-700">
                                {{ $t('meetings.guest.invitedBy', { host: state.info.host_name, company: state.info.company_name }) }}
                            </p>
                            <p class="text-sm text-gray-600">
                                {{ $t('meetings.guest.when', { date: formatDate(state.info.starts_at), from: formatTime(state.info.starts_at), to: formatTime(state.info.ends_at) }) }}
                            </p>
                            <p class="text-xs text-gray-500">{{ $t('meetings.guest.noAccountNeeded') }}</p>
                        </template>
                    </MeetingRoom>
                </div>
            </LoadingSpinner>
        </div>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useI18n } from 'vue-i18n'
import MeetingRoom from '@/components/modules/shared/meeting/room.vue'
import { meetingGuestService } from '@/components/api/guest/MeetingGuestService'
import { useUserStore } from '@/store/user'

/**
 * A guest joins an online meeting from the personal link in their
 * invitation: no account, nothing to install. With a waiting room they wait
 * here until the host lets them in; the page asks every few seconds.
 */
const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const { t, locale } = useI18n()
const userStore = useUserStore() as any
const token = route.params.token as string

const state = reactive({
    info: null as any,
    isLoading: true,
    waiting: false,
    inRoom: false,
    error: {} as any,
})

let cancelled = false

onMounted(async () => {
    try {
        const response = await meetingGuestService.show(token)
        state.info = response?.data ?? null
        // A guest has no account to pick a language in: the page speaks the
        // language the invitation was written in.
        if (state.info?.language) {
            userStore.setLanguage(state.info.language)
            locale.value = state.info.language
        }
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
})

onBeforeUnmount(() => { cancelled = true })

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function connect(consent: boolean) {
    state.error = {}
    const answer = (await meetingGuestService.knock(token, consent))?.data

    if (answer?.status === 'admitted') return answer.connection

    state.waiting = true
    try {
        while (!cancelled) {
            await sleep(3000)
            const status = (await meetingGuestService.status(token))?.data
            if (status?.status === 'admitted') return status.connection
            if (status?.status === 'denied') throw new Error(t('meetings.guest.denied'))
        }
        throw new Error('')
    } finally {
        state.waiting = false
    }
}

async function giveConsent() {
    await meetingGuestService.consent(token)
}

const formatDate = (value: string) => moment(value).format('DD-MM-YYYY')
const formatTime = (value: string) => moment(value).format('HH:mm')
</script>
