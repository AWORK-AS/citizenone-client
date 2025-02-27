<template>
    <div>
        <Modal size="sm" :title="$t('citizens.walletTransactions.newWalletTransaction')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenWalletTransactionForm formType="create"
                        :selectedWalletTransaction="state.formWalletTransaction" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="saveWalletTransaction" />
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
})
const router = useRouter()
const citizenWalletUuid = router?.currentRoute?.value?.params?.wallet_uuid
const emit = defineEmits(['close', 'refreshWalletTransactions'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formWalletTransaction: {
        type: '',
        amount: '',
        note: '',
        file: '',
    },
})

function closeModal() {
    emit('close')
}

function refreshWalletTransactions() {
    emit('refreshWalletTransactions')
}

async function saveWalletTransaction(walletTransactionDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        let params = new FormData()
        params.append('wallet_uuid', citizenWalletUuid.toString())
        params.append('type', walletTransactionDetails.type)
        params.append('amount', walletTransactionDetails.amount)
        if (walletTransactionDetails.note) {
            params.append('note', walletTransactionDetails.note)
        }
        if (walletTransactionDetails.file) {
            params.append('file', walletTransactionDetails.file)
        }
        const response = await citizenWalletTransactionService.saveWalletTransaction(params)
        if (response?.data) {
            refreshWalletTransactions()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.walletTransactions.form.alert.savedSuccessfully')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>