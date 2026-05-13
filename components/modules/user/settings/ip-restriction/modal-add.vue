<template>
    <div>
        <Modal size="sm" :title="$t('ipRestrictions.addIp')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserSettingsIpRestrictionForm
                        formType="create"
                        :error="state.error"
                        @closeModal="closeModal"
                        @submitForm="addIpRestriction" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { ipRestrictionService } from '@/components/api/user/IpRestrictionService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { t } = useI18n()
const { successAlert } = useAlert()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})

const emit = defineEmits(['close', 'refresh'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
})

function closeModal() {
    state.error = {}
    emit('close')
}

async function addIpRestriction(formData: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        await ipRestrictionService.create(formData)
        successAlert(`${t('alert.success')}!`, `${t('ipRestrictions.alert.added')}.`)
        emit('refresh')
        closeModal()
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
