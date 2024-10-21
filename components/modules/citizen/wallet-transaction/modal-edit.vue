<template>
    <div>
        <Modal size="xs" :title="$t('citizens.walletTransactions.editWalletTransaction')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesCitizenWalletTransactionForm formType="update"
                        :selectedWalletTransaction="props.selectedWalletTranscation" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="updateWalletTranscation" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { citizenWalletTransactionService } from '@/components/api/CitizenWalletTransactionService'
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
    selectedWalletTranscation: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshWalletTransactions'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false
})

function closeModal() {
    emit('close')
}

function refreshWalletTransactions() {
    emit('refreshWalletTransactions')
}

async function updateWalletTranscation(walletTransactionDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const walletTransactionUuid = props.selectedWalletTranscation?.uuid

        let params = new FormData()
        params.append('walletTransactionUuid', walletTransactionUuid)
        params.append('type', walletTransactionDetails.type)
        params.append('amount', walletTransactionDetails.amount)
        params.append('note', walletTransactionDetails.note)
        if (walletTransactionDetails.file) {
            params.append('file', walletTransactionDetails.file)
        }
        const response = await citizenWalletTransactionService.updateWalletTransaction(walletTransactionUuid, params)
        if (response?.data) {
            refreshWalletTransactions()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.walletTransactions.form.alert.updatedSuccessfully')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>