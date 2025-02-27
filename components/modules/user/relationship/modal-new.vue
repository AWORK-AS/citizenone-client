<template>
    <div>
        <Modal size="xs" :title="$t('relationships.newRelationship')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserRelationshipModalForm formType="create" :selectedRelationship="state.formRelationship"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveRelationship" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { relationshipService } from '@/components/api/user/RelationshipService'
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
const emit = defineEmits(['close', 'refreshRelationships'])

const state = reactive({
    error: {} as Error,
    formRelationship: {
        name: '',
    },
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshRelationships() {
    emit('refreshRelationships')
}

async function saveRelationship(relationshipDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: relationshipDetails.name,
        }
        const response = await relationshipService.saveRelationship(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('relationships.form.alert.newRelationshipSuccessfullySaved')}.`)
            refreshRelationships()
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>