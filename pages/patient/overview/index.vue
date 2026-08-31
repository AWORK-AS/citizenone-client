<template>
    <div>
        <NuxtLayout name="patient">

            <Head>
                <Title>{{ $t('sidebar.overview') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('sidebar.overview') }}</template>

            <div class="mt-2 space-y-8">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <LoadingSpinner :isActive="state.isLoading">
                    <div class="bg-white rounded-2xl border border-gray-200 px-6 py-6">
                        <p class="text-sm text-gray-500">{{ today }}</p>
                        <h2 class="mt-2 text-2xl font-semibold text-primary">
                            {{ $t('patient.overview.greeting', { name: state.overview?.firstname ?? '' }) }}
                        </h2>
                        <p class="mt-2 text-sm text-gray-600 max-w-2xl">
                            {{ $t('patient.overview.intro') }}
                        </p>
                    </div>

                    <section>
                        <p class="mb-3 text-xs font-bold text-primary uppercase tracking-widest">
                            {{ $t('patient.overview.waitingForYou') }}
                        </p>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button v-for="card in cards" :key="card.href" type="button"
                                class="text-left bg-white rounded-2xl border border-gray-200 px-5 py-5 hover:border-primary/40 hover:shadow-card-hover transition"
                                @click="navigateTo(card.href)">
                                <div class="flex items-center gap-2">
                                    <Icon :name="card.icon" class="h-5 w-5 text-primary" aria-hidden="true" />
                                    <span class="font-semibold text-gray-900">{{ card.title }}</span>
                                    <Badge v-if="card.count > 0" type="notification" class="ml-auto">
                                        {{ card.count }}
                                    </Badge>
                                </div>
                                <p class="mt-2 text-sm text-gray-500">{{ card.text }}</p>
                            </button>
                        </div>
                    </section>

                    <section v-if="state.overview?.clinic">
                        <p class="mb-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                            {{ $t('patient.overview.yourClinic') }}
                        </p>
                        <div class="bg-white rounded-2xl border border-gray-200 px-5 py-4 space-y-1 text-sm">
                            <p class="font-semibold text-gray-900">{{ state.overview.clinic.name }}</p>
                            <p class="text-gray-600" v-if="state.overview.clinic.address">
                                {{ state.overview.clinic.address }}
                            </p>
                            <p class="text-gray-600" v-if="state.overview.clinic.phone">
                                {{ state.overview.clinic.phone }}
                            </p>
                        </div>
                    </section>
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { patientService } from '@/components/api/patient/PatientService'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    isLoading: false,
    overview: null as any,
})

const today = computed(() => moment().format('D. MMM YYYY'))

// The same three counts the sidebar badges show, as cards that lead straight to
// the thing that is waiting.
const cards = computed(() => [
    {
        href: '/patient/messages',
        icon: 'heroicons:envelope',
        title: t('sidebar.messages'),
        count: state.overview?.unread_messages_count ?? 0,
        text: t('patient.overview.unreadMessages', { count: state.overview?.unread_messages_count ?? 0 }),
    },
    {
        href: '/patient/appointments',
        icon: 'heroicons:clock',
        title: t('patient.nav.appointments'),
        count: state.overview?.upcoming_appointments_count ?? 0,
        text: t('patient.overview.upcomingAppointments', { count: state.overview?.upcoming_appointments_count ?? 0 }),
    },
    {
        href: '/patient/surveys',
        icon: 'ph:clipboard-text',
        title: t('sidebar.surveys'),
        count: state.overview?.pending_surveys_count ?? 0,
        text: t('patient.overview.pendingSurveys', { count: state.overview?.pending_surveys_count ?? 0 }),
    },
])

onMounted(() => fetchOverview())

async function fetchOverview() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await patientService.getOverview()
        if (response?.data) state.overview = response.data
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}
</script>
