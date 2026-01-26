<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>
                    {{ $t('clientInvoices.invoiceDetails') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('clientInvoices.invoiceDetails') }}</template>

            <div class="mt-10">
                <LoadingSpinner :isActive="state.isPageLoading">
                    <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/invoices">
                        <Icon name="ph:arrow-left" size="20" class="text-black" />
                        <span>{{ $t('back') }}</span>
                    </NuxtLink>
                    <div class="flex items-center gap-x-2 justify-end">
                        <FormButton buttonStyle="action" class="rounded-lg" @click="downloadInvoiceDetails">
                            <Icon name="ph:download" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('clientInvoices.table.actions.download') }}
                        </FormButton>
                    </div>
                    <div class="grid grid-cols-1 gap-1 md:grid-cols-2">
                        <div>
                            <p>
                                {{ $t('invoiceDetails.invoiceNumber') }}:
                                {{ state.invoice?.data?.invoice_number }}
                            </p>
                            <p>
                                {{ $t('invoiceDetails.date') }}:
                                {{ formatDateToReadable(state.invoice?.data?.created_at) }}
                            </p>
                        </div>
                        <div>
                            <div>
                                <p class="text-lg">
                                    {{ $t('invoiceDetails.billTo') }}:
                                    {{ state.invoice?.data?.bill_to_name }}
                                </p>
                                <p class="text-sm ml-16">
                                    {{ state.invoice?.data?.bill_to_number }}
                                </p>
                                <p class="text-sm ml-16">
                                    {{ state.invoice?.data?.bill_to_address }}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="mt-5 space-y-5">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="table-responsive">
                            <Table :columnHeaders="state.columnHeaders" :data="state.invoice"
                                :isLoading="state.isPageLoading">
                                <template #body
                                    v-if="!(state.isPageLoading || (state.invoice?.data?.client_invoice_details?.length === 0))">
                                    <tr v-for="(data, index) in state.invoice?.data?.client_invoice_details"
                                        :key="index">
                                        <td width="20%">
                                            <div>
                                                {{ data?.description }}
                                            </div>
                                        </td>
                                        <td width="20%">
                                            <div>
                                                {{ formatAmount(data?.price ?? 0) }}
                                            </div>
                                        </td>
                                        <td width="20%">
                                            <div>
                                                {{ data?.quantity }}
                                            </div>
                                        </td>
                                        <td width="20%">
                                            <div>
                                                {{ formatAmount(data?.tax ?? 0) }}
                                            </div>
                                        </td>
                                        <td width="20%">
                                            <div>
                                                {{ formatAmount(data?.amount ?? 0) }}
                                            </div>
                                        </td>
                                    </tr>
                                </template>
                            </Table>
                        </div>
                    </div>
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { clientInvoiceService } from '@/components/api/user/ClientInvoiceService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import type { Error } from '@/types'
import { saveAs } from 'file-saver'
import { useAmountFormatter } from '@/composables/amountFormatter'

const runtimeConfig = useRuntimeConfig()
const { formatAmount } = useAmountFormatter()
const { formatDateToReadable } = useDatetimeFormatter()
const router = useRouter()
const invoiceUuid = router?.currentRoute?.value?.params?.invoice_uuid
const breadcrumbLinks = [
    {
        name: 'invoices.invoices',
        translate: true,
        href: '/settings/invoices',
    },
    {
        name: 'invoiceDetails.invoiceDetails',
        translate: true,
        href: `/settings/invoices/${invoiceUuid}`,
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'clientInvoices.table.description', isTranslateName: true, },
        { name: 'clientInvoices.table.price', isTranslateName: true, },
        { name: 'clientInvoices.table.quantity', isTranslateName: true, },
        { name: 'clientInvoices.table.tax', isTranslateName: true, },
        { name: 'clientInvoices.table.amount', isTranslateName: true, },
    ],
    error: {} as Error,
    invoice: [] as any,
    isPageLoading: false,
})

onMounted(() => {
    fetchClientInvoice()
})

async function fetchClientInvoice() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await clientInvoiceService.getClientInvoiceDetails(invoiceUuid)
        if (response) {
            state.invoice = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function downloadInvoiceDetails() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await clientInvoiceService.downloadClientInvoiceDetails(invoiceUuid)
        if (response) {
            if (response) {
                saveAs(response, state?.invoice?.data?.invoice_number ?? invoiceUuid.toString())
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>