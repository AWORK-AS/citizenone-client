<template>
    <div>
        <Modal size="sm" :title="$t('ipRestrictions.editIp')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserSettingsIpRestrictionForm
                        formType="update"
                        :selectedIpRestriction="props.selectedIpRestriction"
                        :error="state.error"
                        @closeModal="closeModal"
                        @submitForm="updateIpRestriction" />
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
    selectedIpRestriction: {
        type: Object,
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

async function updateIpRestriction(formData: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        await ipRestrictionService.update(props.selectedIpRestriction.uuid, formData)
        successAlert(`${t('alert.success')}!`, `${t('ipRestrictions.alert.updated')}.`)
        emit('refresh')
        closeModal()
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
