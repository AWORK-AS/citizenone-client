<template>
    <div>
        <Modal size="sm" :title="$t('invoices.email.newReceiver')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserInvoiceFormEmailReceiver formType="create"
                        :selectedInvoiceReceiver="state.formEmailReceiver" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="saveEmailReceiver" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { invoiceReceiverService } from '@/components/api/InvoiceReceiverService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshInvoiceReceivers'])

const state = reactive({
    error: {} as Error,
    formEmailReceiver: {
        firstname: '',
        lastname: '',
        email: '',
    },
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshInvoiceReceivers() {
    emit('refreshInvoiceReceivers')
}

async function saveEmailReceiver(invoiceReceiverDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            firstname: invoiceReceiverDetails.firstname,
            lastname: invoiceReceiverDetails.lastname,
            email: invoiceReceiverDetails.email,
        }
        const response = await invoiceReceiverService.saveInvoiceReceiver(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('invoices.email.form.alert.newEmailReceiverSuccessfullySaved')}.`)
            refreshInvoiceReceivers()
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>