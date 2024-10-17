<template>
    <div>
        <Modal size="xs" :title="$t('citizens.wallets.newWallet')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesCitizenWalletForm formType="create" :selectedWallet="state.formWallet" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="saveWallet" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { citizenWalletService } from '@/components/api/CitizenWalletService'
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
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const emit = defineEmits(['close', 'refreshWallets'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formWallet: {
        uuid: '',
        name: '',
        note: '',
    },
})

function closeModal() {
    emit('close')
}

function refreshWallets() {
    emit('refreshWallets')
}

async function saveWallet(walletDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            citizen_uuid: citizenUuid,
            name: walletDetails.name,
        }
        const response = await citizenWalletService.saveWallet(params)
        if (response?.data) {
            refreshWallets()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.wallets.form.alert.savedSuccessfully')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>