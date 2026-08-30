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
                                                <span v-if="line.is_invoiced"
                                                    class="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-500">
                                                    <Icon name="ph:receipt" class="size-3.5" />
                                                    {{ $t('citizens.priceEstimates.invoiced') }}
                                                </span>
                                                <button v-else type="button" @click="toggleLine(line)" :class="[
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
                                    <div class="flex justify-between text-primary"
                                        v-if="estimate.status === 'accepted' && Number(estimate.billable_amount) > 0">
                                        <dt>{{ $t('citizens.priceEstimates.leftToSettle') }}</dt>
                                        <dd class="tabular-nums font-semibold">{{ formatAmount(estimate.billable_amount) }}</dd>
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
                                <FormButton buttonStyle="primary" buttonSize="xs" v-if="canSettle(estimate)"
                                    @click="openSettle(estimate)">
                                    <Icon name="ph:hand-coins" class="size-4" />
                                    {{ $t('citizens.priceEstimates.settleNow') }}
                                </FormButton>
                                <FormButton buttonStyle="action" buttonSize="xs" v-if="canSettle(estimate)"
                                    @click="raiseInvoice(estimate)">
                                    <Icon name="ph:paper-plane-tilt" class="size-4" />
                                    {{ $t('citizens.priceEstimates.createInvoice') }}
                                </FormButton>
                                <FormButton buttonStyle="action" buttonSize="xs" @click="remove(estimate)">
                                    <Icon name="ph:trash" class="size-4" />
                                    {{ $t('delete') }}
                                </FormButton>
                            </div>

                            <!-- An estimate is a quote and an invoice is the bill that follows
                                 it. The two sit in tabs beside each other with nothing saying
                                 they are two steps of one thing, so an accepted estimate says
                                 where it goes next. -->
                            <p class="mt-2 flex items-center gap-1.5 text-xs text-gray-500"
                                v-if="nextStep(estimate)">
                                <Icon name="ph:arrow-right" class="size-3.5 shrink-0" aria-hidden="true" />
                                <span>{{ nextStep(estimate) }}</span>
                                <button type="button" class="underline hover:text-gray-700"
                                    v-if="estimate.status === 'accepted' && hasInvoicing && !hasBillableWork(estimate)"
                                    @click="navigateTo(`/citizens/${citizenUuid}/invoices`)">
                                    {{ $t('citizens.tabs.invoices') }}
                                </button>
                            </p>
                        </div>
                    </div>
                </LoadingSpinner>
            </div>

            <ModulesUserCitizenPriceEstimateModalForm :isModalOpen="state.isModalOpen" :citizenUuid="citizenUuid"
                :estimate="state.selectedEstimate" :teeth="state.teeth" @close="state.isModalOpen = false"
                @saved="onSaved" />

            <ModulesUserCitizenPriceEstimateModalSettle :isModalOpen="state.isSettleOpen" :citizenUuid="citizenUuid"
                :estimate="state.settlingEstimate" @close="state.isSettleOpen = false" @settled="onSettled" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { saveAs } from 'file-saver'
import { priceEstimateService } from '@/components/api/user/PriceEstimateService'
import { citizenInvoiceService } from '@/components/api/user/CitizenInvoiceService'
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
    settlingEstimate: null as any,
    isModalOpen: false,
    isSettleOpen: false,
    isPageLoading: true,
    error: '',
})

// Price estimates exist for dental clinics, and only for the ones that quote:
// a clinic that has switched the module off should not reach the page by URL
// either, the same rule the tab follows.
watch(() => userStore.getUser, (user: any) => {
    if (!user?.uuid) return

    const isDental = user?.company?.industry?.system_name === 'dental'
    const quotes = user?.company?.onboarding_preferences?.modules?.priceEstimates !== false

    if (!isDental || !quotes) navigateTo(`/citizens/${citizenUuid}/journals`)
}, { immediate: true })

/**
 * Whether there is anything to charge for yet.
 *
 * Money needs the invoicing app: without it there is nowhere for an invoice to
 * live, so the estimate stays what it was. With it, an accepted estimate offers
 * settlement as soon as a treatment has been marked carried out.
 */
function canSettle(estimate: any): boolean {
    return !!userStore.getUser?.has_invoice_app
        && estimate.status === 'accepted'
        && Number(estimate.billable_amount) > 0
}

const hasInvoicing = computed(() => !!userStore.getUser?.has_invoice_app)

function hasBillableWork(estimate: any): boolean {
    return Number(estimate.billable_amount) > 0
}

/**
 * What happens to this estimate next, in one line.
 *
 * Nothing here is new behaviour - it is the sentence the screen never said. An
 * accepted quote turns into an invoice by marking the treatments carried out,
 * and until someone does that, the buttons that would do the billing are
 * correctly absent and unexplained.
 */
function nextStep(estimate: any): string {
    if (estimate.status !== 'accepted') return ''
    if (!hasInvoicing.value) return ''

    if (hasBillableWork(estimate)) return t('citizens.priceEstimates.nextStepSettle')

    const allInvoiced = (estimate.lines || []).length > 0
        && (estimate.lines || []).every((line: any) => line.is_invoiced)

    return allInvoiced
        ? t('citizens.priceEstimates.nextStepInvoiced')
        : t('citizens.priceEstimates.nextStepMarkDone')
}

function openSettle(estimate: any) {
    state.settlingEstimate = estimate
    state.isSettleOpen = true
}

async function onSettled() {
    state.isSettleOpen = false
    successAlert(t('citizens.priceEstimates.settled'))
    await loadEstimates()
}

/**
 * Raises the invoice without taking the money, for a patient who will be sent
 * a bill rather than paying on the way out. It lands on the invoices tab, where
 * it can be sent with a payment link.
 */
async function raiseInvoice(estimate: any) {
    try {
        await citizenInvoiceService.createFromEstimate(citizenUuid, estimate.uuid)
        successAlert(t('citizens.priceEstimates.invoiceCreated'))
        await loadEstimates()
    } catch (error: any) {
        state.error = error?.message || ''
    }
}

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
