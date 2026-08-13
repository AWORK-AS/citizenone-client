<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.tabs.invoices') }} - {{ runtimeConfig?.public?.appName }}</Title>
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

            <template #header>{{ $t('citizens.tabs.invoices') }}</template>

            <div class="space-y-5">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesUserCitizenDetailsHeader />
                <ModulesUserCitizenJournalTabs />

                <Alert type="danger" :text="state.error" v-if="state.error" />

                <div class="flex justify-end">
                    <FormButton buttonStyle="action" @click="state.isModalOpen = true">
                        <Icon name="ph:plus" class="size-4" />
                        {{ $t('citizens.invoices.newTitle') }}
                    </FormButton>
                </div>

                <LoadingSpinner :isActive="state.isPageLoading">
                    <div v-if="state.invoices.length === 0"
                        class="px-6 py-14 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg text-center">
                        <div class="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                            <Icon name="ph:receipt" class="h-7 w-7 text-primary" />
                        </div>
                        <h3 class="mt-4 text-lg font-semibold text-gray-900">{{ $t('citizens.invoices.empty.title') }}</h3>
                        <p class="mt-1 text-sm text-gray-500 max-w-md mx-auto">{{ $t('citizens.invoices.empty.text') }}</p>
                    </div>

                    <div v-else class="space-y-3">
                        <div v-for="invoice in state.invoices" :key="invoice.uuid"
                            class="px-4 py-4 sm:px-6 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
                            <div class="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p class="font-medium text-gray-900">
                                        {{ $t('citizens.invoices.invoice') }}
                                        <span class="tabular-nums">{{ invoice.invoice_number }}</span>
                                    </p>
                                    <p class="text-xs text-gray-500">
                                        {{ formatDate(invoice.issued_at) }}
                                        <template v-if="invoice.due_at">
                                            &middot; {{ $t('citizens.invoices.form.dueAt') }}
                                            {{ formatDate(invoice.due_at) }}
                                        </template>
                                        <template v-if="invoice.created_by"> &middot; {{ invoice.created_by }}</template>
                                    </p>
                                </div>
                                <Badge :type="statusStyle(invoice.status)">
                                    {{ $t(`citizens.invoices.statuses.${invoice.status}`) }}
                                </Badge>
                            </div>

                            <div class="mt-3 overflow-x-auto">
                                <table class="min-w-full text-sm">
                                    <thead>
                                        <tr class="text-left text-xs uppercase tracking-wide text-gray-500">
                                            <th class="py-1 pr-3">{{ $t('citizens.invoices.form.description') }}</th>
                                            <th class="py-1 pr-3 text-right">{{ $t('citizens.invoices.form.quantity') }}</th>
                                            <th class="py-1 pr-3 text-right">{{ $t('citizens.invoices.form.unitPrice') }}</th>
                                            <th class="py-1 pr-3 text-right">{{ $t('citizens.invoices.form.subsidy') }}</th>
                                            <th class="py-1 text-right">{{ $t('citizens.invoices.form.lineTotal') }}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="line in invoice.lines" :key="line.uuid" class="border-t border-gray-100">
                                            <td class="py-1 pr-3">
                                                {{ line.description }}
                                                <span class="text-gray-400" v-if="line.code">({{ line.code }})</span>
                                            </td>
                                            <td class="py-1 pr-3 text-right tabular-nums">{{ line.quantity }}</td>
                                            <td class="py-1 pr-3 text-right tabular-nums">{{ formatAmount(line.unit_price) }}</td>
                                            <td class="py-1 pr-3 text-right tabular-nums">{{ formatAmount(line.subsidy_amount) }}</td>
                                            <td class="py-1 text-right tabular-nums">{{ formatAmount(line.net + line.vat) }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div class="mt-3 flex flex-wrap items-end justify-between gap-3">
                                <div class="space-y-1" v-if="invoice.payments?.length">
                                    <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                                        {{ $t('citizens.invoices.payments') }}
                                    </p>
                                    <p v-for="payment in invoice.payments" :key="payment.uuid" class="text-sm text-gray-600">
                                        {{ formatDate(payment.paid_at) }} &middot;
                                        {{ $t(`citizens.invoices.methods.${payment.method}`) }} &middot;
                                        <span class="tabular-nums">{{ formatAmount(payment.amount) }}</span>
                                        <span class="text-xs text-gray-400" v-if="payment.recorded_by">
                                            &middot; {{ payment.recorded_by }}
                                        </span>
                                    </p>
                                </div>

                                <dl class="w-full sm:w-64 text-sm space-y-1 ml-auto">
                                    <div class="flex justify-between">
                                        <dt class="text-gray-500">{{ $t('citizens.invoices.toPay') }}</dt>
                                        <dd class="tabular-nums">{{ formatAmount(invoice.total_amount) }}</dd>
                                    </div>
                                    <div class="flex justify-between">
                                        <dt class="text-gray-500">{{ $t('citizens.invoices.paid') }}</dt>
                                        <dd class="tabular-nums">{{ formatAmount(invoice.paid_amount) }}</dd>
                                    </div>
                                    <div class="flex justify-between border-t border-gray-300 pt-1 font-semibold">
                                        <dt>{{ $t('citizens.invoices.outstanding') }}</dt>
                                        <dd class="tabular-nums">{{ formatAmount(invoice.outstanding) }}</dd>
                                    </div>
                                </dl>
                            </div>

                            <div class="mt-3 flex flex-wrap items-center gap-2">
                                <FormButton buttonStyle="action" buttonSize="xs" @click="downloadPdf(invoice)">
                                    <Icon name="ph:file-pdf" class="size-4" />
                                    {{ $t('citizens.invoices.downloadPdf') }}
                                </FormButton>
                                <FormButton buttonStyle="action" buttonSize="xs" @click="setStatus(invoice, 'sent')"
                                    v-if="invoice.status === 'draft'">
                                    <Icon name="ph:paper-plane-tilt" class="size-4" />
                                    {{ $t('citizens.invoices.markSent') }}
                                </FormButton>
                                <FormButton buttonStyle="primary" buttonSize="xs" @click="openPayment(invoice)"
                                    v-if="invoice.outstanding > 0 && invoice.status !== 'cancelled'">
                                    <Icon name="ph:cash-register" class="size-4" />
                                    {{ $t('citizens.invoices.registerPayment') }}
                                </FormButton>
                                <FormButton buttonStyle="action" buttonSize="xs" @click="remove(invoice)"
                                    v-if="!invoice.payments?.length">
                                    <Icon name="ph:trash" class="size-4" />
                                    {{ $t('delete') }}
                                </FormButton>
                            </div>

                            <div class="mt-3 rounded-lg border border-gray-200 p-3" v-if="state.payingUuid === invoice.uuid">
                                <div class="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
                                    <div class="space-y-1">
                                        <FormLabel for="payment_amount" :label="$t('citizens.invoices.amount')" />
                                        <FormNumberField name="payment_amount" :min="0" v-model="state.payment.amount"
                                            :placeholder="$t('citizens.invoices.amount')" />
                                    </div>
                                    <div class="space-y-1">
                                        <FormLabel for="payment_method" :label="$t('citizens.invoices.method')" />
                                        <FormSelect id="payment_method" :options="methodOptions"
                                            v-model="state.payment.method" />
                                    </div>
                                    <div class="space-y-1">
                                        <FormLabel for="paid_at" :label="$t('citizens.invoices.paidAt')" />
                                        <FormDateField id="paid_at" name="paid_at" v-model="state.payment.paid_at"
                                            :placeholder="$t('citizens.invoices.paidAt')" />
                                    </div>
                                    <div class="flex items-center justify-end gap-2">
                                        <FormButton buttonStyle="action" buttonSize="xs" @click="state.payingUuid = null">
                                            {{ $t('cancel') }}
                                        </FormButton>
                                        <FormButton buttonStyle="primary" buttonSize="xs" @click="savePayment(invoice)">
                                            {{ $t('save') }}
                                        </FormButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </LoadingSpinner>
            </div>

            <ModulesUserCitizenInvoiceModalForm :isModalOpen="state.isModalOpen" :citizenUuid="citizenUuid"
                :services="state.services" @close="state.isModalOpen = false" @saved="onSaved" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { saveAs } from 'file-saver'
import { citizenInvoiceService } from '@/components/api/user/CitizenInvoiceService'
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

const breadcrumbLinks = [{ name: 'citizens.tabs.invoices', translate: true, href: `/citizens/${citizenUuid}/invoices` }]

const state = reactive({
    invoices: [] as any[],
    services: [] as any[],
    isModalOpen: false,
    payingUuid: null as string | null,
    payment: { amount: '', method: 'card', paid_at: '' },
    isPageLoading: true,
    error: '',
})

// Invoicing is switched on per company from the app store, and the API says so
// too, so a company without it never lands here.
watch(() => userStore.getUser, (user: any) => {
    if (user?.uuid && !user?.has_invoice_app) navigateTo(`/citizens/${citizenUuid}/journals`)
}, { immediate: true })

const methodOptions = computed(() => ['cash', 'card', 'mobilepay', 'bank_transfer', 'terminal', 'other']
    .map((method: string) => ({ value: method, label: t(`citizens.invoices.methods.${method}`) })))

function statusStyle(status: string): string {
    if (status === 'paid') return 'active'
    if (status === 'cancelled') return 'inactive'
    if (status === 'partly_paid') return 'pending'

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

async function load() {
    state.error = ''

    try {
        const [invoices, services] = await Promise.all([
            citizenInvoiceService.getForCitizen(citizenUuid),
            citizenInvoiceService.getServices(),
        ])

        state.invoices = invoices?.data || []
        state.services = services?.data || []
    } catch (error: any) {
        state.error = error?.message || ''
    } finally {
        state.isPageLoading = false
    }
}

async function onSaved() {
    state.isModalOpen = false
    successAlert(`${t('alert.success')}!`, `${t('citizens.invoices.saved')}.`)
    await load()
}

async function setStatus(invoice: any, status: string) {
    state.error = ''

    try {
        await citizenInvoiceService.updateStatus(invoice.uuid, { status })
        await load()
    } catch (error: any) {
        state.error = error?.message || ''
    }
}

function openPayment(invoice: any) {
    state.payingUuid = invoice.uuid
    // The whole outstanding amount is what is usually handed over, so it is
    // filled in and can be corrected.
    state.payment = { amount: String(invoice.outstanding), method: 'card', paid_at: '' }
}

async function savePayment(invoice: any) {
    state.error = ''

    try {
        await citizenInvoiceService.addPayment(invoice.uuid, {
            amount: Number(state.payment.amount) || 0,
            method: state.payment.method,
            paid_at: state.payment.paid_at || null,
        })

        state.payingUuid = null
        await load()
    } catch (error: any) {
        state.error = error?.message || ''
    }
}

async function downloadPdf(invoice: any) {
    state.error = ''

    try {
        const response = await citizenInvoiceService.downloadPdf(invoice.uuid)
        const blob = response instanceof Blob ? response : new Blob([response as any], { type: 'application/pdf' })

        saveAs(blob, `faktura-${invoice.invoice_number}.pdf`)
    } catch (error: any) {
        state.error = error?.message || ''
    }
}

async function remove(invoice: any) {
    state.error = ''

    try {
        await citizenInvoiceService.deleteInvoice(invoice.uuid)
        await load()
    } catch (error: any) {
        state.error = error?.message || ''
    }
}

onMounted(() => load())
</script>
