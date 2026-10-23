<template>
    <div>
        <NuxtLayout name="patient">

            <Head>
                <Title>{{ $t('videoConsultation.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('videoConsultation.title') }}</template>

            <div class="mt-6 space-y-5">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/patient/appointments">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <LoadingSpinner :isActive="state.isLoading">
                    <div class="px-4 py-6 sm:p-8 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg" v-if="state.session">
                        <VideoConsultationRoom :key="state.attempt" :session="state.session" @rejoin="fetchSession" />
                    </div>
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import VideoConsultationRoom from '@/components/modules/shared/video-consultation/room.vue'
import { patientVideoConsultationService } from '@/components/api/patient/VideoConsultationService'
import type { Error } from '@/types'

/**
 * The patient's side of a video consultation. Reached from the appointment
 * ("Join video consultation"); {uuid} is the appointment's calendar event.
 * The patient is logged in to their own portal - there is no link anyone
 * else could open.
 */
const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const uuid = router?.currentRoute?.value?.params?.uuid as string

const state = reactive({ error: {} as Error, isLoading: false, session: null as any, attempt: 0 })

onMounted(() => fetchSession())

// A fresh token every time: on first open and when rejoining after leaving.
async function fetchSession() {
    state.isLoading = true
    state.error = {} as Error
    try {
        const response = await patientVideoConsultationService.join(uuid)
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
</script>
