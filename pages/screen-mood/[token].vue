<template>
    <Head>
        <Title>{{ $t('infoScreenMood.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
    </Head>

    <div class="min-h-screen bg-[#f8fafc] px-4 py-8">
        <div class="mx-auto max-w-md space-y-6">
            <div class="flex justify-center"><Logo /></div>

            <div v-if="state.isLoading" class="flex justify-center py-12">
                <Icon name="ph:spinner-gap" class="h-8 w-8 animate-spin text-[#0f4c75]" />
            </div>

            <div v-else-if="!state.open" class="rounded-2xl border border-[#e2e8f0] bg-white p-6 text-center text-[#64748b]">
                {{ $t('infoScreenMood.closed') }}
            </div>

            <!-- Answered today -->
            <div v-else-if="state.answered" class="rounded-2xl border border-[#e2e8f0] bg-white p-8 text-center shadow-sm">
                <Icon name="ph:heart-fill" class="thanks h-16 w-16 text-[#2dbab2]" />
                <h1 class="mt-4 text-2xl font-semibold text-[#1a2332]">{{ $t('infoScreenMood.thanks') }}</h1>
                <p class="mt-2 text-[#64748b]">{{ $t('infoScreenMood.tomorrow') }}</p>
            </div>

            <div v-else class="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
                <h1 class="text-center text-2xl font-semibold text-[#1a2332]">{{ $t('infoScreenMood.question') }}</h1>
                <!-- Big faces, with words: easy to hit and to understand -->
                <div class="mt-8 grid grid-cols-3 gap-3">
                    <button v-for="face in FACES" :key="face.mood" type="button" :disabled="state.isSending"
                        class="flex flex-col items-center gap-2 rounded-2xl border-2 border-[#e2e8f0] px-2 py-5 transition active:scale-95 disabled:opacity-50"
                        :class="face.hover" @click="answer(face.mood)">
                        <Icon :name="face.icon" class="h-16 w-16" :class="face.color" />
                        <span class="text-base font-semibold text-[#1a2332]">{{ $t(face.label) }}</span>
                    </button>
                </div>
                <p v-if="state.error" class="mt-4 text-center text-sm text-[#dc2626]">{{ state.error }}</p>
            </div>

            <p class="text-center text-xs text-[#64748b]">{{ $t('infoScreenMood.anonymous') }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/store/user'

/**
 * "How are you today?" from a phone, by the QR code on an info screen. No
 * login and nothing about the person is asked: the phone keeps a random id, so
 * it answers once a day.
 */
const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const { t, locale } = useI18n()
const userStore = useUserStore() as any
const token = route.params.token as string

const VOTER_KEY = 'citizenone-info-screen-voter'
const answeredKey = () => `citizenone-info-screen-mood:${token}:${new Date().toLocaleDateString('en-CA')}`

const FACES = [
    { mood: 1, icon: 'ph:smiley-sad', label: 'infoScreenMood.sad', color: 'text-[#c2410c]', hover: 'hover:border-[#fed7aa] hover:bg-[#fff7ed]' },
    { mood: 2, icon: 'ph:smiley-meh', label: 'infoScreenMood.meh', color: 'text-[#64748b]', hover: 'hover:border-[#cbd5e1] hover:bg-[#f8fafc]' },
    { mood: 3, icon: 'ph:smiley', label: 'infoScreenMood.happy', color: 'text-[#2dbab2]', hover: 'hover:border-[#2dbab2] hover:bg-[#f0faf9]' },
]

const state = reactive({
    isLoading: true,
    isSending: false,
    open: false,
    answered: false,
    error: '',
})

function storage(): Storage | null {
    try { return window.localStorage } catch { return null }
}

function voterId(): string {
    const store = storage()
    let id = store?.getItem(VOTER_KEY) ?? ''
    if (id.length < 16) {
        id = crypto.randomUUID().replace(/-/g, '')
        try { store?.setItem(VOTER_KEY, id) } catch { /* private mode: one answer per visit */ }
    }
    return id
}

function api(path: string, options: any = {}) {
    return $fetch(path, { baseURL: runtimeConfig.public.apiBaseURL, headers: { Accept: 'application/json' }, ...options })
}

onMounted(async () => {
    try {
        const response: any = await api(`/info-screen/mood/${token}`)
        state.open = true
        if (response?.data?.language) {
            userStore.setLanguage(response.data.language)
            locale.value = response.data.language
        }
        state.answered = !!storage()?.getItem(answeredKey())
    } catch {
        state.open = false
    }
    state.isLoading = false
})

async function answer(mood: number) {
    state.isSending = true
    state.error = ''
    try {
        await api(`/info-screen/mood/${token}`, { method: 'POST', body: { mood, voter: voterId() } })
        try { storage()?.setItem(answeredKey(), '1') } catch { /* ignore */ }
        state.answered = true
    } catch (error: any) {
        state.error = error?.response?.status === 404 ? t('infoScreenMood.closed') : t('infoScreenMood.failed')
    }
    state.isSending = false
}
</script>

<style scoped>
.thanks {
    animation: beat 1.2s ease-in-out 2;
}

@keyframes beat {
    30% {
        transform: scale(1.15);
    }
}

@media (prefers-reduced-motion: reduce) {
    .thanks {
        animation: none;
    }
}
</style>
