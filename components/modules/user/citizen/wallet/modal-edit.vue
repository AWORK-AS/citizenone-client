<template>
    <div>
        <Modal size="xs" :title="$t('citizens.wallets.editWallet')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenWalletForm formType="update" :selectedWallet="props.selectedWallet"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="updateWallet" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { citizenWalletService } from '@/components/api/user/CitizenWalletService'
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
    selectedWallet: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshWallets'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false
})

function closeModal() {
    emit('close')
}

function refreshWallets() {
    emit('refreshWallets')
}

async function updateWallet(walletDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const walletUuid = walletDetails.uuid
        const params = {
            name: walletDetails.name,
            note: walletDetails.note,
            deactivate_end_of_month: walletDetails.deactivate_end_of_month,
        }
        const response = await citizenWalletService.updateWallet(walletUuid, params)
        if (response?.data) {
            refreshWallets()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.wallets.form.alert.updatedSuccessfully')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>