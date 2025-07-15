<template>
    <div>
        <Modal size="xs"
            :title="`${$t('addictions.new')} ${customPagesStore.getCustomPagesName?.addictions?.toLowerCase()}`"
            :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserAddictionModalForm formType="create" :selectedAddiction="state.formAddiction"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveAddiction" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { addictionService } from '@/components/api/user/AddictionService'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const customPagesStore = useCustomPagesStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshAddictions'])

const state = reactive({
    error: {} as Error,
    formAddiction: {
        name: '',
    },
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshAddictions() {
    emit('refreshAddictions')
}

async function saveAddiction(addictionDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: addictionDetails.name,
        }
        const response = await addictionService.saveAddiction(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('addictions.form.alert.new')} ${customPagesStore.getCustomPagesName?.addictions?.toLowerCase()} ${t('addictions.form.alert.successfullySaved')?.toLowerCase()}.`)
            refreshAddictions()
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>