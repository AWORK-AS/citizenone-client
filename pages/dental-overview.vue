<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('dentalOverview.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('dentalOverview.title') }}</template>

            <div class="space-y-5">
                <Alert type="danger" :text="state.error" v-if="state.error" />

                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                        <button type="button" @click="navigateTo('/dental-recalls')"
                            class="rounded-xl bg-white px-4 py-4 text-left shadow-sm ring-1 ring-gray-900/5 transition hover:ring-primary/30">
                            <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                {{ $t('dentalOverview.overdue') }}
                            </p>
                            <p class="mt-1 text-2xl font-semibold tabular-nums"
                                :class="state.data?.recalls?.overdue ? 'text-red-600' : 'text-gray-900'">
                                {{ state.data?.recalls?.overdue ?? 0 }}
                            </p>
                            <p class="text-xs text-gray-500">{{ $t('dentalOverview.overdueHelp') }}</p>
                        </button>

                        <button type="button" @click="navigateTo('/dental-recalls')"
                            class="rounded-xl bg-white px-4 py-4 text-left shadow-sm ring-1 ring-gray-900/5 transition hover:ring-primary/30">
                            <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                {{ $t('dentalOverview.dueSoon') }}
                            </p>
                            <p class="mt-1 text-2xl font-semibold text-gray-900 tabular-nums">
                                {{ state.data?.recalls?.due_soon ?? 0 }}
                            </p>
                            <p class="text-xs text-gray-500">
                                {{ $t('dentalOverview.dueSoonHelp', { days: state.data?.recalls?.window_days ?? 30 }) }}
                            </p>
                        </button>

                        <div class="rounded-xl bg-white px-4 py-4 shadow-sm ring-1 ring-gray-900/5">
                            <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                {{ $t('dentalOverview.plannedWork') }}
                            </p>
                            <p class="mt-1 text-2xl font-semibold text-gray-900 tabular-nums">
                                {{ state.data?.treatment_plan?.open_lines ?? 0 }}
                            </p>
                            <p class="text-xs text-gray-500">
                                {{ $t('dentalOverview.plannedWorkHelp', {
                                    patients: state.data?.treatment_plan?.patients ?? 0,
                                    value: formatAmount(state.data?.treatment_plan?.value)
                                }) }}
                            </p>
                        </div>

                        <div class="rounded-xl bg-white px-4 py-4 shadow-sm ring-1 ring-gray-900/5">
                            <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                {{ $t('dentalOverview.awaitingAnswer') }}
                            </p>
                            <p class="mt-1 text-2xl font-semibold text-gray-900 tabular-nums">
                                {{ state.data?.estimates?.awaiting_answer ?? 0 }}
                            </p>
                            <p class="text-xs text-gray-500">
                                {{ $t('dentalOverview.awaitingAnswerHelp', {
                                    value: formatAmount(state.data?.estimates?.value)
                                }) }}
                            </p>
                        </div>
                    </div>

                    <div class="mt-5 grid grid-cols-1 xl:grid-cols-2 gap-5">
                        <div class="rounded-xl bg-white px-4 py-4 shadow-sm ring-1 ring-gray-900/5">
                            <div class="flex items-center justify-between gap-3">
                                <h3 class="text-base font-semibold text-gray-900">
                                    {{ $t('dentalOverview.mostOverdue') }}
                                </h3>
                                <button type="button" class="text-sm font-medium text-primary hover:underline"
                                    @click="navigateTo('/dental-recalls')">
                                    {{ $t('dentalOverview.seeAll') }}
                                </button>
                            </div>

                            <p class="mt-3 text-sm text-gray-500" v-if="!state.data?.recalls?.most_overdue?.length">
                                {{ $t('dentalOverview.noOverdue') }}
                            </p>

                            <ul class="mt-3 divide-y divide-gray-100" v-else>
                                <li v-for="recall in state.data.recalls.most_overdue" :key="recall.citizen_uuid"
                                    class="flex items-center justify-between gap-3 py-2">
                                    <button type="button" class="text-sm font-medium text-primary hover:underline"
                                        @click="navigateTo(`/citizens/${recall.citizen_uuid}/tooth-chart`)">
                                        {{ recall.name }}
                                    </button>
                                    <span class="text-xs text-red-600 tabular-nums">
                                        {{ formatDate(recall.due_date) }}
                                    </span>
                                </li>
                            </ul>
                        </div>

                        <div class="rounded-xl bg-white px-4 py-4 shadow-sm ring-1 ring-gray-900/5">
                            <h3 class="text-base font-semibold text-gray-900">
                                {{ $t('dentalOverview.oldestPlanned') }}
                            </h3>

                            <p class="mt-3 text-sm text-gray-500" v-if="!state.data?.treatment_plan?.oldest?.length">
                                {{ $t('dentalOverview.noPlanned') }}
                            </p>

                            <ul class="mt-3 divide-y divide-gray-100" v-else>
                                <li v-for="(line, index) in state.data.treatment_plan.oldest" :key="index"
                                    class="flex items-center justify-between gap-3 py-2">
                                    <div>
                                        <button type="button" class="text-sm font-medium text-primary hover:underline"
                                            @click="navigateTo(`/citizens/${line.citizen_uuid}/price-estimates`)">
                                            {{ line.name }}
                                        </button>
                                        <p class="text-xs text-gray-500">
                                            <span v-if="line.fdi_number" class="tabular-nums">
                                                {{ $t('citizens.toothChart.tooth') }} {{ line.fdi_number }} &middot;
                                            </span>
                                            {{ line.description }}
                                        </p>
                                    </div>
                                    <span class="text-xs text-gray-500 tabular-nums">
                                        {{ formatDate(line.accepted_at) }}
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <p class="mt-4 text-xs text-gray-500">
                        {{ $t('dentalOverview.examinations', {
                            total: state.data?.examinations?.this_year ?? 0,
                            reportable: state.data?.examinations?.reportable_this_year ?? 0
                        }) }}
                    </p>
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { dentalDashboardService } from '@/components/api/user/DentalDashboardService'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'

const { industryHasFeature } = useIndustryFeatures()
const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore() as any
const { locale } = useI18n()

const breadcrumbLinks = [{ name: 'dentalOverview.title', translate: true, href: '/dental-overview' }]

const state = reactive({
    data: null as any,
    isPageLoading: true,
    error: '',
})

// The clinic overview belongs to dental clinics, the same rule the API enforces.
watch(() => userStore.getUser, (user: any) => {
    if (user?.uuid && !industryHasFeature('clinicOverview')) {
        navigateTo('/overview')
    }
}, { immediate: true })

function formatAmount(amount: number | undefined): string {
    return new Intl.NumberFormat(locale.value === 'en' ? 'en-GB' : 'da-DK', {
        maximumFractionDigits: 0,
    }).format(Number(amount) || 0)
}

function formatDate(date: string): string {
    return date ? moment(date).format('DD.MM.YYYY') : ''
}

async function load() {
    state.error = ''

    try {
        const response = await dentalDashboardService.getDashboard()
        state.data = response?.data || null
    } catch (error: any) {
        state.error = error?.message || ''
    } finally {
        state.isPageLoading = false
    }
}

onMounted(() => load())
</script>
