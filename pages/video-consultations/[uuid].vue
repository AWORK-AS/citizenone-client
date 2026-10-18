<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('videoConsultation.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('videoConsultation.title') }}</template>

            <button type="button" class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" @click="router.back()">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </button>

            <Alert type="danger" :text="state.error?.message"
                v-if="state.error?.message && state.error.message.length > 0" />

            <LoadingSpinner :isActive="state.isLoading">
                <div class="px-4 py-6 sm:p-8 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg" v-if="state.session">
                    <VideoConsultationRoom :key="state.attempt" :session="state.session" @rejoin="fetchSession"
                        @end="endForEveryone" />
                </div>
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import VideoConsultationRoom from '@/components/modules/shared/video-consultation/room.vue'
import { videoConsultationService } from '@/components/api/user/VideoConsultationService'
import type { Error } from '@/types'

/**
 * The clinician's side of a video consultation, opened from the calendar
 * event. {uuid} is that event; only its owner, creator or invitees get a token.
 */
const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const uuid = router?.currentRoute?.value?.params?.uuid as string

const state = reactive({ error: {} as Error, isLoading: false, session: null as any, attempt: 0 })

onMounted(() => fetchSession())

async function fetchSession() {
    state.isLoading = true
    state.error = {} as Error
    try {
        const response = await videoConsultationService.join(uuid)
        if (response?.data) {
            state.session = response.data
            state.attempt++
        }
    } catch (error: any) {
        state.session = null
        state.error = error
    }
    state.isLoading = false
}

async function endForEveryone() {
    try {
        await videoConsultationService.end(uuid)
    } catch (error: any) {
        state.error = error
    }
}
</script>
