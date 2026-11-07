<template>
    <Head>
        <Title>{{ state.poll?.question ?? $t('infoScreenVote.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
    </Head>

    <div class="min-h-screen bg-[#f8fafc] px-4 py-8">
        <div class="mx-auto max-w-md space-y-6">
            <div class="flex justify-center"><Logo /></div>

            <div v-if="state.isLoading" class="flex justify-center py-12">
                <Icon name="ph:spinner-gap" class="h-8 w-8 animate-spin text-[#0f4c75]" />
            </div>

            <div v-else-if="!state.poll" class="rounded-2xl border border-[#e2e8f0] bg-white p-6 text-center text-[#64748b]">
                {{ $t('infoScreenVote.closed') }}
            </div>

            <div v-else class="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
                <p class="text-xs font-semibold uppercase tracking-widest text-[#2dbab2]">{{ $t('infoScreenVote.title') }}</p>
                <h1 class="mt-2 text-2xl font-semibold text-[#1a2332]">{{ state.poll.question }}</h1>

                <!-- Choose -->
                <div v-if="!state.voted" class="mt-6 space-y-3">
                    <button v-for="(option, index) in state.poll.options" :key="option.title" type="button"
                        :disabled="state.isSending"
                        class="w-full rounded-xl border border-[#e2e8f0] px-4 py-4 text-left text-lg text-[#1a2332] transition hover:border-[#2dbab2] hover:bg-[#f0faf9] active:scale-[0.98] disabled:opacity-50"
                        @click="vote(index)">
                        {{ option.title }}
                    </button>
                </div>

                <!-- Results -->
                <div v-else class="mt-6 space-y-4">
                    <p class="flex items-center gap-2 text-sm font-semibold text-[#1b6d8a]">
                        <Icon name="ph:check-circle-fill" class="h-5 w-5 text-[#2dbab2]" />
                        {{ state.alreadyVoted ? $t('infoScreenVote.alreadyVoted') : $t('infoScreenVote.thanks') }}
                    </p>
                    <div v-for="(option, index) in state.poll.options" :key="option.title">
                        <div class="mb-1 flex justify-between text-sm text-[#1a2332]">
                            <span :class="{ 'font-semibold': index === state.choice }">{{ option.title }}</span>
                            <span class="tabular-nums text-[#64748b]">{{ shares[index] }}%</span>
                        </div>
                        <div class="h-3 overflow-hidden rounded-full bg-[#e2e8f0]">
                            <div class="h-full rounded-full bg-[#2dbab2] transition-[width] duration-1000"
                                :style="{ width: `${state.showBars ? shares[index] : 0}%` }" />
                        </div>
                    </div>
                    <p class="text-xs text-[#64748b]">{{ $t('infoScreenVote.votes', { count: state.poll.total }) }}</p>
                </div>

                <p v-if="state.error" class="mt-4 text-sm text-[#dc2626]">{{ state.error }}</p>
            </div>

            <p class="text-center text-xs text-[#64748b]">{{ $t('infoScreenVote.anonymous') }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/store/user'
import { pollShares } from '@/composables/infoScreen'

/**
 * Voting on an info screen's poll from a phone, by the QR code on the screen.
 * No login and nothing about the voter is asked: the phone keeps a random id,
 * so it votes once per poll round.
 */
const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const { t, locale } = useI18n()
const userStore = useUserStore() as any
const token = route.params.token as string

const VOTER_KEY = 'citizenone-info-screen-voter'
const votedKey = (round: number) => `citizenone-info-screen-voted:${token}:${round}`

const state = reactive({
    isLoading: true,
    isSending: false,
    poll: null as any,
    voted: false,
    alreadyVoted: false,
    showBars: false,
    choice: null as number | null,
    error: '',
})

const shares = computed(() => pollShares(state.poll?.options ?? []))

function storage(): Storage | null {
    try { return window.localStorage } catch { return null }
}

function voterId(): string {
    const store = storage()
    let id = store?.getItem(VOTER_KEY) ?? ''
    if (id.length < 16) {
        id = crypto.randomUUID().replace(/-/g, '')
        try { store?.setItem(VOTER_KEY, id) } catch { /* private mode: one vote per visit */ }
    }
    return id
}

function api(path: string, options: any = {}) {
    return $fetch(path, { baseURL: runtimeConfig.public.apiBaseURL, headers: { Accept: 'application/json' }, ...options })
}

function showResults(poll: any, alreadyVoted: boolean) {
    state.poll = poll
    state.voted = true
    state.alreadyVoted = alreadyVoted
    try { storage()?.setItem(votedKey(poll.round), String(state.choice ?? '')) } catch { /* ignore */ }
    requestAnimationFrame(() => requestAnimationFrame(() => { state.showBars = true }))
}

onMounted(async () => {
    try {
        const response: any = await api(`/info-screen/poll/${token}`)
        state.poll = response?.data ?? null
        if (state.poll?.language) {
            userStore.setLanguage(state.poll.language)
            locale.value = state.poll.language
        }
        const earlier = state.poll ? storage()?.getItem(votedKey(state.poll.round)) : null
        if (earlier !== null && earlier !== undefined) {
            state.choice = earlier === '' ? null : Number(earlier)
            showResults(state.poll, true)
        }
    } catch {
        state.poll = null
    }
    state.isLoading = false
})

async function vote(index: number) {
    state.isSending = true
    state.error = ''
    state.choice = index
    try {
        const response: any = await api(`/info-screen/poll/${token}/vote`, { method: 'POST', body: { option: index, voter: voterId() } })
        showResults(response?.data, !!response?.data?.already_voted)
    } catch (error: any) {
        state.error = error?.response?.status === 404 ? t('infoScreenVote.closed') : t('infoScreenVote.failed')
    }
    state.isSending = false
}
</script>
