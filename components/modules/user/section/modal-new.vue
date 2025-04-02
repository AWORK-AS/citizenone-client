<template>
    <div>
        <Modal size="xs" :title="$t('sections.newSection')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserSectionModalForm formType="create" :selectedSection="state.formSection"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveSection" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { sectionService } from '@/components/api/user/SectionService'
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
const emit = defineEmits(['close', 'refreshSections'])

const state = reactive({
    error: {} as Error,
    formSection: {
        name: '',
    },
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshSections() {
    emit('refreshSections')
}

async function saveSection(sectionDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: sectionDetails.name,
        }
        const response = await sectionService.saveSection(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('sections.form.alert.newSectionSuccessfullySaved')}.`)
            refreshSections()
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>