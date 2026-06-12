<template>
    <Head>
        <Title>{{ state.report?.title ?? $t('citizenReports.reports') }} - {{ runtimeConfig?.public?.appName }}</Title>
    </Head>

    <LoadingSpinner :isActive="state.isLoading">
        <div class="bg-gray-50 min-h-screen">
            <div class="px-4 md:px-0 sm:mx-auto sm:w-full sm:max-w-3xl py-10">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <div v-if="state.report" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                    <!-- Header -->
                    <div class="border-b border-gray-100 pb-4">
                        <h1 class="text-xl font-semibold text-gray-900">{{ state.report.title }}</h1>
                        <div class="flex items-center gap-3 mt-2">
                            <Badge type="active">{{ $t('citizenReports.finalized') }}</Badge>
                            <span v-if="state.report.agreement_type" class="text-sm text-gray-500">
                                {{ state.report.agreement_type }}
                            </span>
                        </div>
                    </div>

                    <!-- Meta -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div v-if="state.report.citizen">
                            <p class="font-medium text-gray-700">{{ $t('citizenReports.form.citizen') }}</p>
                            <p class="text-gray-900">{{ state.report.citizen.firstname }} {{ state.report.citizen.lastname }}</p>
                        </div>
                        <div v-if="state.report.caseworker">
                            <p class="font-medium text-gray-700">{{ $t('citizenReports.form.caseworker') }}</p>
                            <p class="text-gray-900">{{ state.report.caseworker.firstname }} {{ state.report.caseworker.lastname }}</p>
                        </div>
                        <div v-if="state.report.consultant">
                            <p class="font-medium text-gray-700">{{ $t('citizenReports.form.consultant') }}</p>
                            <p class="text-gray-900">{{ state.report.consultant.firstname }} {{ state.report.consultant.lastname }}</p>
                        </div>
                    </div>

                    <!-- Body -->
                    <div>
                        <p class="text-sm font-medium text-gray-700 mb-2">{{ $t('citizenReports.form.body') }}</p>
                        <div class="prose prose-sm max-w-none" v-html="state.report.body" />
                    </div>

                    <!-- Footer -->
                    <div v-if="state.report.finalized_at" class="border-t border-gray-100 pt-4 text-xs text-gray-400">
                        {{ $t('citizenReports.finalized') }}: {{ formatDateToReadable(state.report.finalized_at) }}
                    </div>
                </div>
            </div>
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { citizenReportService } from '@/components/api/user/CitizenReportService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import type { Error } from '@/types'

definePageMeta({ layout: false })

const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const { formatDateToReadable } = useDatetimeFormatter()
const token = route.params.token

const state = reactive({
    error: {} as Error,
    isLoading: false,
    report: null as any,
})

onMounted(() => {
    fetchReport()
})

async function fetchReport() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await citizenReportService.getPublicReport(token)
        if (response?.data) {
            state.report = response.data
        }
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}
</script>
