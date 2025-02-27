<template>
    <div>
        <Modal size="xs" :title="$t('invoices.email.editReceiver')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserInvoiceFormEmailReceiver formType="update"
                        :selectedInvoiceReceiver="props.selectedInvoiceReceiver" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="updateInvoiceReceiver" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { invoiceReceiverService } from '@/components/api/user/InvoiceReceiverService'
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
    selectedInvoiceReceiver: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshInvoiceReceivers'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false
})

function closeModal() {
    emit('close')
}

function refreshInvoiceReceivers() {
    emit('refreshInvoiceReceivers')
}

async function updateInvoiceReceiver(invoiceReceiverDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const invoiceReceiverUuid = props.selectedInvoiceReceiver?.uuid
        const params = {
            firstname: invoiceReceiverDetails.firstname,
            lastname: invoiceReceiverDetails.lastname,
            email: invoiceReceiverDetails.email,
        }
        const response = await invoiceReceiverService.updateInvoiceReceiver(invoiceReceiverUuid, params)
        if (response?.data) {
            refreshInvoiceReceivers()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('invoices.email.form.alert.emailReceiverSuccessfullyUpdated')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>