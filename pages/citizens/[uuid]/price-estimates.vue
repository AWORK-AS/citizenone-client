<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.tabs.priceEstimates') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks">
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400" />
                            <button @click="navigateTo('/citizens')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ customPagesStore.getCustomPagesName?.citizens }}
                            </button>
                        </div>
                    </template>
                </Breadcrumb>
            </template>

            <template #header>{{ $t('citizens.tabs.priceEstimates') }}</template>

            <div class="space-y-5">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesUserCitizenDetailsHeader />
                <ModulesUserCitizenJournalTabs />

                <Alert type="danger" :text="state.error" v-if="state.error" />

                <div class="flex justify-end">
                    <FormButton buttonStyle="action" @click="openModal(null)">
                        <Icon name="ph:plus" class="size-4" />
                        {{ $t('citizens.priceEstimates.newTitle') }}
                    </FormButton>
                </div>

                <LoadingSpinner :isActive="state.isPageLoading">
                    <div v-if="state.estimates.length === 0"
                        class="px-6 py-14 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg text-center">
                        <div class="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                            <Icon name="ph:receipt" class="h-7 w-7 text-primary" />
                        </div>
                        <h3 class="mt-4 text-lg font-semibold text-gray-900">
                            {{ $t('citizens.priceEstimates.empty.title') }}
                        </h3>
                        <p class="mt-1 text-sm text-gray-500 max-w-md mx-auto">
                            {{ $t('citizens.priceEstimates.empty.text') }}
                        </p>
                    </div>

                    <div v-else class="space-y-3">
                        <div v-for="estimate in state.estimates" :key="estimate.uuid"
                            class="px-4 py-4 sm:px-6 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
                            <div class="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p class="font-medium text-gray-900">
                                        {{ estimate.title || $t('citizens.priceEstimates.newTitle') }}
                                        <span class="text-sm font-normal text-gray-500">
                                            {{ estimate.estimate_number }}
                                        </span>
                                    </p>
                                    <p class="text-xs text-gray-500">
                                        {{ formatDate(estimate.created_at) }}
                                        <template v-if="estimate.created_by"> &middot; {{ estimate.created_by }}</template>
                                        <template v-if="estimate.valid_until">
                                            &middot; {{ $t('citizens.priceEstimates.form.validUntil') }}:
                                            {{ formatDate(estimate.valid_until) }}
                                        </template>
                                    </p>
                                </div>

                                <div class="flex items-center gap-2">
                                    <Badge :type="statusStyle(estimate.status)">
                                        {{ $t(`citizens.priceEstimates.statuses.${estimate.status}`) }}
                                    </Badge>
                                </div>
                            </div>

                            <div class="mt-3 overflow-x-auto">
                                <table class="min-w-full text-sm">
                                    <thead>
                                        <tr class="text-left text-xs uppercase tracking-wide text-gray-500">
                                            <th class="py-1 pr-3">{{ $t('citizens.toothChart.tooth') }}</th>
                                            <th class="py-1 pr-3">{{ $t('citizens.priceEstimates.form.description') }}</th>
                                            <th class="py-1 pr-3 text-right">{{ $t('citizens.priceEstimates.form.quantity') }}</th>
                                            <th class="py-1 pr-3 text-right">{{ $t('citizens.priceEstimates.form.unitPrice') }}</th>
                                            <th class="py-1 pr-3 text-right">{{ $t('citizens.priceEstimates.form.subsidy') }}</th>
                                            <th class="py-1 text-right">{{ $t('citizens.priceEstimates.form.lineTotal') }}</th>
                                            <th class="py-1 pl-3 text-right" v-if="estimate.status === 'accepted'">
                                                {{ $t('citizens.priceEstimates.plan') }}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="line in estimate.lines" :key="line.uuid" class="border-t border-gray-100">
                                            <td class="py-1 pr-3">{{ line.fdi_number || '' }}</td>
                                            <td class="py-1 pr-3">
                                                {{ line.description }}
                                                <span class="text-gray-400" v-if="line.treatment_code">
                                                    ({{ line.treatment_code }})
                                                </span>
                                            </td>
                                            <td class="py-1 pr-3 text-right tabular-nums">{{ line.quantity }}</td>
                                            <td class="py-1 pr-3 text-right tabular-nums">{{ formatAmount(line.unit_price) }}</td>
                                            <td class="py-1 pr-3 text-right tabular-nums">{{ formatAmount(line.subsidy_amount) }}</td>
                                            <td class="py-1 text-right tabular-nums">{{ formatAmount(line.line_total) }}</td>
                                            <td class="py-1 pl-3 text-right" v-if="estimate.status === 'accepted'">
                                                <button type="button" @click="toggleLine(line)" :class="[
                                                    'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium transition',
                                                    line.status === 'done'
                                                        ? 'border-green-600 bg-green-50 text-green-700'
                                                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                                ]">
                                                    <Icon :name="line.status === 'done' ? 'ph:check-circle' : 'ph:circle'"
                                                        class="size-3.5" />
                                                    {{ line.status === 'done'
                                                        ? $t('citizens.priceEstimates.done')
                                                        : $t('citizens.priceEstimates.markDone') }}
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div class="mt-3 flex flex-wrap items-end justify-between gap-3">
                                <p class="text-sm text-gray-600 whitespace-pre-wrap max-w-xl" v-if="estimate.note">
                                    {{ estimate.note }}
                                </p>
                                <dl class="w-full sm:w-64 text-sm space-y-1 ml-auto">
                                    <div class="flex justify-between">
                                        <dt class="text-gray-500">{{ $t('citizens.priceEstimates.total') }}</dt>
                                        <dd class="tabular-nums">{{ formatAmount(estimate.total_amount) }}</dd>
                                    </div>
                                    <div class="flex justify-between">
                                        <dt class="text-gray-500">{{ $t('citizens.priceEstimates.subsidy') }}</dt>
                                        <dd class="tabular-nums">- {{ formatAmount(estimate.total_subsidy) }}</dd>
                                    </div>
                                    <div class="flex justify-between border-t border-gray-300 pt-1 font-semibold">
                                        <dt>{{ $t('citizens.priceEstimates.patientPays') }}</dt>
                                        <dd class="tabular-nums">{{ formatAmount(estimate.patient_amount) }}</dd>
                                    </div>
                                </dl>
                            </div>

                            <div class="mt-3 flex flex-wrap items-center gap-2">
                                <FormButton buttonStyle="action" buttonSize="xs" @click="downloadPdf(estimate)">
                                    <Icon name="ph:file-pdf" class="size-4" />
                                    {{ $t('citizens.toothChart.downloadPdf') }}
                                </FormButton>
                                <FormButton buttonStyle="action" buttonSize="xs" @click="openModal(estimate)"
                                    v-if="isEditable(estimate)">
                                    <Icon name="ph:pencil-simple" class="size-4" />
                                    {{ $t('edit') }}
                                </FormButton>
                                <FormButton buttonStyle="action" buttonSize="xs"
                                    @click="setStatus(estimate, 'sent')" v-if="estimate.status === 'draft'">
                                    <Icon name="ph:paper-plane-tilt" class="size-4" />
                                    {{ $t('citizens.priceEstimates.markSent') }}
                                </FormButton>
                                <FormButton buttonStyle="primary" buttonSize="xs"
                                    @click="setStatus(estimate, 'accepted')" v-if="isEditable(estimate)">
                                    <Icon name="ph:check" class="size-4" />
                                    {{ $t('citizens.priceEstimates.markAccepted') }}
                                </FormButton>
                                <FormButton buttonStyle="action" buttonSize="xs"
                                    @click="setStatus(estimate, 'declined')" v-if="isEditable(estimate)">
                                    <Icon name="ph:x" class="size-4" />
                                    {{ $t('citizens.priceEstimates.markDeclined') }}
                                </FormButton>
                                <FormButton buttonStyle="action" buttonSize="xs" @click="remove(estimate)">
                                    <Icon name="ph:trash" class="size-4" />
                                    {{ $t('delete') }}
                                </FormButton>
                            </div>
                        </div>
                    </div>
                </LoadingSpinner>
            </div>

            <ModulesUserCitizenPriceEstimateModalForm :isModalOpen="state.isModalOpen" :citizenUuid="citizenUuid"
                :estimate="state.selectedEstimate" :teeth="state.teeth" @close="state.isModalOpen = false"
                @saved="onSaved" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { saveAs } from 'file-saver'
import { priceEstimateService } from '@/components/api/user/PriceEstimateService'
import { toothChartService } from '@/components/api/user/ToothChartService'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'

const runtimeConfig = useRuntimeConfig()
const customPagesStore = useCustomPagesStore() as any
const userStore = useUserStore() as any
const { successAlert } = useAlert()
const { t, locale } = useI18n()
const route = useRoute()
const citizenUuid = route?.params?.uuid as string

const breadcrumbLinks = [
    { name: 'citizens.tabs.priceEstimates', translate: true, href: `/citizens/${citizenUuid}/price-estimates` },
]

const state = reactive({
    estimates: [] as any[],
    teeth: [] as any[],
    selectedEstimate: null as any,
    isModalOpen: false,
    isPageLoading: true,
    error: '',
})

// Price estimates only exist for dental clinics, same rule as the tooth chart.
watch(() => userStore.getUser, (user: any) => {
    if (user?.uuid && user?.company?.industry?.system_name !== 'dental') {
        navigateTo(`/citizens/${citizenUuid}/journals`)
    }
}, { immediate: true })

function isEditable(estimate: any): boolean {
    return estimate.status === 'draft' || estimate.status === 'sent' || estimate.status === 'expired'
}

// Badge only knows the styles defined in components/badge/index.vue.
function statusStyle(status: string): string {
    if (status === 'accepted') return 'active'
    if (status === 'declined') return 'inactive'
    if (status === 'expired') return 'pending'

    return 'primary'
}

function formatAmount(amount: number): string {
    return new Intl.NumberFormat(locale.value === 'en' ? 'en-GB' : 'da-DK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(amount) || 0)
}

function formatDate(date: string): string {
    return date ? moment(date).format('DD.MM.YYYY') : ''
}

async function loadEstimates() {
    state.error = ''

    try {
        const response = await priceEstimateService.getEstimates(citizenUuid)
        state.estimates = response?.data || []
    } catch (error: any) {
        state.error = error?.message || ''
    } finally {
        state.isPageLoading = false
    }
}

async function loadTeeth() {
    try {
        const response = await toothChartService.getChart(citizenUuid)
        state.teeth = response?.data?.teeth || []
    } catch {
        // The chart is a convenience here: an estimate line does not need a tooth.
        state.teeth = []
    }
}

function openModal(estimate: any) {
    state.selectedEstimate = estimate
    state.isModalOpen = true
}

async function onSaved() {
    state.isModalOpen = false
    successAlert(`${t('alert.success')}!`, `${t('citizens.priceEstimates.saved')}.`)
    await loadEstimates()
}

// An accepted estimate is the treatment plan, so its lines are ticked off as
// the work is carried out.
async function toggleLine(line: any) {
    state.error = ''

    try {
        await priceEstimateService.completeLine(line.uuid, { done: line.status !== 'done' })
        await loadEstimates()
    } catch (error: any) {
        state.error = error?.message || ''
    }
}

async function setStatus(estimate: any, status: string) {
    state.error = ''

    try {
        await priceEstimateService.updateStatus(estimate.uuid, { status })
        await loadEstimates()
    } catch (error: any) {
        state.error = error?.message || ''
    }
}

async function remove(estimate: any) {
    state.error = ''

    try {
        await priceEstimateService.deleteEstimate(estimate.uuid)
        await loadEstimates()
    } catch (error: any) {
        state.error = error?.message || ''
    }
}

async function downloadPdf(estimate: any) {
    state.error = ''

    try {
        const response = await priceEstimateService.downloadPdf(estimate.uuid)
        const blob = response instanceof Blob ? response : new Blob([response as any], { type: 'application/pdf' })

        saveAs(blob, `prisoverslag-${estimate.estimate_number}.pdf`)
    } catch (error: any) {
        state.error = error?.message || ''
    }
}

onMounted(() => {
    loadEstimates()
    loadTeeth()
})
</script>
