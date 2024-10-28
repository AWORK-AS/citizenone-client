<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>
                    {{ $t('superadmin.invoiceDetails.invoiceDetails') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #header>{{ $t('superadmin.invoiceDetails.invoiceDetails') }}</template>

            <LoadingSpinner :isActive="state.isPageLoading">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/superadmin/invoices">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <div class="flex items-center gap-x-2 justify-end">
                    <FormButton buttonStyle="action" class="rounded-lg" @click="downloadInvoiceDetails">
                        <Icon name="ph:download" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('superadmin.invoiceDetails.download') }}
                    </FormButton>
                </div>
                <div class="grid grid-cols-1 gap-1 md:grid-cols-2">
                    <div>
                        <p>
                            {{ $t('superadmin.invoiceDetails.invoiceNumber') }}:
                            {{ state.invoice?.data?.invoice_number }}
                        </p>
                        <p>
                            {{ $t('superadmin.invoiceDetails.date') }}:
                            {{ formatDateToReadable(state.invoice?.data?.created_at) }}
                        </p>
                    </div>
                    <div>
                        <div>
                            {{ $t('superadmin.invoiceDetails.billTo') }}:
                            <p class="text-lg">
                                {{ state.invoice?.data?.user?.company?.name }}
                            </p>
                            <p class="text-sm">
                                {{ state.invoice?.data?.user?.firstname }}
                                {{ state.invoice?.data?.user?.lastname }}
                            </p>
                            <p class="text-sm">
                                {{ state.invoice?.data?.user?.email }}
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
                                v-if="!(state.isPageLoading || (state.invoice?.data?.invoice_details?.length === 0))">
                                <tr v-for="(data, index) in state.invoice?.data?.invoice_details" :key="index">
                                    <td width="20%">
                                        <div>
                                            {{ data?.deal?.name }}
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
                                            {{ formatAmount(data?.tax_amount ?? 0) }}
                                        </div>
                                    </td>
                                    <td width="20%">
                                        <div>
                                            {{ formatAmount(((data?.price ?? 0) * (data?.quantity ?? 0)) +
                                                (data?.tax_amount ?? 0)) }}
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                </div>
                <p class="text-center mt-10 text-sm text-primary">
                    {{ $t('superadmin.invoiceDetails.thisInvoiceHasAlreadyBeenPaid') }}
                </p>
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { invoiceService } from '@/components/api/superadmin/InvoiceService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import type { Error } from '@/types'
import { saveAs } from 'file-saver'

const runtimeConfig = useRuntimeConfig()
const { formatDateToReadable } = useDatetimeFormatter()
const router = useRouter()
const invoiceUuid = router?.currentRoute?.value?.params?.invoice_uuid

const state = reactive({
    columnHeaders: [
        { name: 'superadmin.invoiceDetails.table.description' },
        { name: 'superadmin.invoiceDetails.table.price' },
        { name: 'superadmin.invoiceDetails.table.quantity' },
        { name: 'superadmin.invoiceDetails.table.tax' },
        { name: 'superadmin.invoiceDetails.table.amount' },
    ],
    error: {} as Error,
    invoice: [] as any,
    isPageLoading: false,
})

onMounted(() => {
    fetchInvoices()
})

async function fetchInvoices() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await invoiceService.getInvoiceDetails(invoiceUuid)
        if (response) {
            state.invoice = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function formatAmount(amount: any) {
    // Convert the number to a string with two decimal places
    let numberStr = parseFloat(amount).toFixed(2)

    // Split the string into integer and decimal parts
    let parts = numberStr.split('.')
    let integerPart = parts[0]
    let decimalPart = parts[1]

    // Add the thousands separators
    let formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

    // Combine the integer part with the decimal part
    return 'DKK ' + formattedIntegerPart + ',' + decimalPart
}

async function downloadInvoiceDetails() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await invoiceService.downloadInvoiceDetails(invoiceUuid)
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