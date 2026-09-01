<template>
    <div>
        <NuxtLayout name="patient">

            <Head>
                <Title>{{ $t('patient.nav.priceEstimates') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('patient.nav.priceEstimates') }}</template>

            <div class="mt-2 space-y-5">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <p class="text-sm text-gray-600 max-w-2xl">{{ $t('patient.priceEstimates.intro') }}</p>

                <LoadingSpinner :isActive="state.isLoading">
                    <div v-if="state.estimates.length === 0 && !state.isLoading">
                        <Alert type="info" :text="$t('patient.priceEstimates.empty')" />
                    </div>

                    <div v-else class="space-y-3">
                        <article v-for="estimate in state.estimates" :key="estimate.uuid"
                            class="bg-white rounded-2xl border border-gray-200 px-5 py-4 space-y-3">
                            <div class="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p class="font-semibold text-gray-900">{{ estimate.title }}</p>
                                    <p class="text-sm text-gray-500">
                                        {{ estimate.estimate_number }} · {{ formatDate(estimate.sent_at) }}
                                    </p>
                                </div>
                                <p class="text-lg font-semibold text-primary tabular-nums">
                                    {{ formatAmount(estimate.patient_amount) }}
                                </p>
                            </div>

                            <dl class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                                <div>
                                    <dt class="text-gray-400">{{ $t('patient.priceEstimates.total') }}</dt>
                                    <dd class="text-gray-900 tabular-nums">{{ formatAmount(estimate.total_amount) }}</dd>
                                </div>
                                <div>
                                    <dt class="text-gray-400">{{ $t('patient.priceEstimates.subsidy') }}</dt>
                                    <dd class="text-gray-900 tabular-nums">{{ formatAmount(estimate.total_subsidy) }}</dd>
                                </div>
                                <div>
                                    <dt class="text-gray-400">{{ $t('patient.priceEstimates.yourShare') }}</dt>
                                    <dd class="font-semibold text-gray-900 tabular-nums">
                                        {{ formatAmount(estimate.patient_amount) }}
                                    </dd>
                                </div>
                            </dl>

                            <p class="text-sm text-gray-500" v-if="estimate.valid_until">
                                {{ $t('patient.priceEstimates.validUntil', { date: formatDate(estimate.valid_until) }) }}
                            </p>

                            <button type="button" class="text-sm text-primary underline"
                                @click="toggleLines(estimate)">
                                {{ state.openUuid === estimate.uuid
                                    ? $t('patient.priceEstimates.hideLines')
                                    : $t('patient.priceEstimates.showLines') }}
                            </button>

                            <div v-if="state.openUuid === estimate.uuid" class="table-responsive">
                                <table class="min-w-full text-sm">
                                    <thead>
                                        <tr class="text-left text-gray-400">
                                            <th class="py-1.5 pr-3 font-medium">{{ $t('patient.priceEstimates.treatment') }}</th>
                                            <th class="py-1.5 pr-3 font-medium">{{ $t('patient.priceEstimates.quantity') }}</th>
                                            <th class="py-1.5 pr-3 font-medium">{{ $t('patient.priceEstimates.price') }}</th>
                                            <th class="py-1.5 font-medium">{{ $t('patient.priceEstimates.subsidy') }}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(line, index) in state.lines" :key="index" class="border-t border-gray-100">
                                            <td class="py-1.5 pr-3 text-gray-900">{{ line.description }}</td>
                                            <td class="py-1.5 pr-3 tabular-nums">{{ line.quantity }}</td>
                                            <td class="py-1.5 pr-3 tabular-nums">{{ formatAmount(line.unit_price) }}</td>
                                            <td class="py-1.5 tabular-nums">{{ formatAmount(line.subsidy_amount) }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </article>
                    </div>
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { patientPriceEstimateService } from '@/components/api/patient/PriceEstimateService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatAmount } = useAmountFormatter()

const state = reactive({
    error: {} as Error,
    isLoading: false,
    estimates: [] as any[],
    openUuid: null as string | null,
    lines: [] as any[],
})

function formatDate(date: any) {
    return date ? moment(date).format('DD-MM-YYYY') : '-'
}

onMounted(() => fetchEstimates())

async function fetchEstimates() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await patientPriceEstimateService.getPriceEstimates()
        state.estimates = response?.data ?? []
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

// The lines are fetched only when opened: a list of estimates does not need every treatment
// line, and an estimate can carry a lot of them.
async function toggleLines(estimate: any) {
    if (state.openUuid === estimate.uuid) {
        state.openUuid = null
        state.lines = []

        return
    }

    state.error = {}
    try {
        const response = await patientPriceEstimateService.getPriceEstimate(estimate.uuid)
        state.lines = response?.data?.lines ?? []
        state.openUuid = estimate.uuid
    } catch (error: any) {
        state.error = error
    }
}
</script>
