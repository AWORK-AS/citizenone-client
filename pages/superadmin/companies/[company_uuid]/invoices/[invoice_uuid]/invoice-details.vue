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
                    :to="`/superadmin/companies/${companyUuid}/invoices`">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <div class="flex items-center gap-x-2 justify-end">
                    <FormButton buttonStyle="action" @click="downloadInvoiceDetails">
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
                                            {{ data?.other }}
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
                                            {{ formatAmount(data?.total ?? 0) }}
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
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'
import { saveAs } from 'file-saver'

const runtimeConfig = useRuntimeConfig()
const { formatAmount } = useAmountFormatter()
const { formatDateToReadable } = useDatetimeFormatter()
const language = useI18n()
const router = useRouter()
const companyUuid = router?.currentRoute?.value?.params?.company_uuid
const invoiceUuid = router?.currentRoute?.value?.params?.invoice_uuid

const state = reactive({
    columnHeaders: [
        { name: 'superadmin.invoiceDetails.table.description', isTranslateName: true, },
        { name: 'superadmin.invoiceDetails.table.price', isTranslateName: true, },
        { name: 'superadmin.invoiceDetails.table.quantity', isTranslateName: true, },
        { name: 'superadmin.invoiceDetails.table.tax', isTranslateName: true, },
        { name: 'superadmin.invoiceDetails.table.amount', isTranslateName: true, },
    ],
    error: {} as Error,
    invoice: [] as any,
    isPageLoading: false,
})

onMounted(() => {
    fetchInvoice()
})

watch(() => language.locale.value, (language: any) => {
    if (language) {
        fetchInvoice()
    }
})

async function fetchInvoice() {
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