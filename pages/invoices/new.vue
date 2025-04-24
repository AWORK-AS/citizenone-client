<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('clientInvoices.newInvoice') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks">
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo('/invoices')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ $t('clientInvoices.clientInvoices') }}
                            </button>
                        </div>
                    </template>
                </Breadcrumb>
            </template>

            <template #header>{{ $t('clientInvoices.newInvoice') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/invoices">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserClientInvoiceForm formType="create" :selectedInvoice="state.formInvoice"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="saveInvoice" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { clientInvoiceService } from '@/components/api/user/ClientInvoiceService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const breadcrumbLinks = [
    {
        name: 'clientInvoices.newInvoice',
        translate: true,
        href: '/invoices/new',
    },
]

const state = reactive({
    error: {} as Error,
    formInvoice: {
        bill_to_name: '',
        bill_to_address: '',
        bill_to_number: '',
        invoice_details: [],
    },
    isPageLoading: false,
})

async function saveInvoice(invoiceDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            'bill_to_name': invoiceDetails.bill_to_name,
            'bill_to_address': invoiceDetails.bill_to_address,
            'bill_to_number': invoiceDetails.bill_to_number,
            'invoice_details': invoiceDetails.invoice_details,
        }
        const response = await clientInvoiceService.saveClientInvoice(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('clientInvoices.form.alert.invoiceSuccessfullyAdded')}.`)
            navigateTo('/invoices')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>