<template>

    <Head>
        <Title>{{ $t('meetings.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
    </Head>

    <div class="min-h-screen bg-[#f8fafc] py-8 px-4">
        <div class="max-w-md mx-auto space-y-6">
            <!-- The organisation's own logo when it has one: guests trust a link they recognise. -->
            <img v-if="state.door?.logo_url" :src="state.door.logo_url" :alt="state.door.company_name || ''"
                class="mx-auto max-h-16 max-w-[220px] object-contain" />
            <Logo v-else class="mx-auto" />

            <LoadingSpinner :isActive="state.isLoading">
                <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />

                <form v-if="state.door" class="px-4 py-6 sm:p-8 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-2xl space-y-4"
                    @submit.prevent="enter">
                    <div class="text-center">
                        <h1 class="text-lg font-semibold text-gray-900">{{ $t('meetings.personalRoom.doorTitle', { host: state.door.host_name }) }}</h1>
                        <p v-if="state.door.company_name" class="text-sm text-gray-600">{{ state.door.company_name }}</p>
                    </div>
                    <div>
                        <label class="co-detail-label" for="room-name">{{ $t('meetings.personalRoom.yourName') }}</label>
                        <input id="room-name" v-model="form.name" type="text" required minlength="2" maxlength="120"
                            autocomplete="name" class="co-input mt-1" />
                    </div>
                    <div>
                        <label class="co-detail-label" for="room-email">{{ $t('meetings.personalRoom.yourEmail') }}</label>
                        <input id="room-email" v-model="form.email" type="email" maxlength="255" autocomplete="email" class="co-input mt-1" />
                    </div>
                    <button type="submit" :disabled="state.isEntering || form.name.trim().length < 2"
                        class="w-full h-11 rounded-full bg-[#0f4c75] hover:bg-[#0f2b46] text-white font-medium disabled:opacity-50">
                        {{ $t('meetings.personalRoom.goIn') }}
                    </button>
                    <p class="text-xs text-gray-500 text-center">{{ $t('meetings.personalRoom.doorHint') }}</p>
                </form>
            </LoadingSpinner>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { meetingGuestService } from '@/components/api/guest/MeetingGuestService'
import { useUserStore } from '@/store/user'

/**
 * The door to a host's personal meeting room (/meet/r/{slug}): the visitor
 * gives a name and goes on to the usual guest page, where they wait until
 * the host lets them in.
 */
const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const { locale } = useI18n()
const userStore = useUserStore() as any
const slug = route.params.slug as string

const state = reactive({
    door: null as any,
    isLoading: true,
    isEntering: false,
    error: {} as any,
})
const form = reactive({ name: '', email: '' })

onMounted(async () => {
    try {
        const response = await meetingGuestService.roomDoor(slug)
        state.door = response?.data ?? null
        if (state.door?.language) {
            userStore.setLanguage(state.door.language)
            locale.value = state.door.language
        }
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
})

async function enter() {
    state.isEntering = true
    state.error = {}
    try {
        const response = await meetingGuestService.enterRoom(slug, {
            name: form.name.trim(),
            email: form.email.trim() || null,
        })
        if (response?.data?.token) {
            await navigateTo(`/meet/${response.data.token}`)
            return
        }
    } catch (error: any) {
        state.error = error
    }
    state.isEntering = false
}
</script>
