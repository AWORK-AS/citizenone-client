<template>
    <div>
        <Modal size="xs" :title="$t('dutySchedules.draftTemplates.form.applyTemplate')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserDutyScheduleDraftTemplatesApplyTemplateForm formType="create"
                        :selected-draft-template="props.selectedDraftTemplate"
                        :selected-templates="props.selectedTemplates"
                        :error="state.error"
                        @closeModal="closeModal"
                        @submitForm="applyTemplate" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { draftTemplateService } from '@/components/api/user/DraftTemplateService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'
import { useUserStore } from '@/store/user'

const userStore = useUserStore() as any
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const { successAlert } = useAlert()
const { t } = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedDraftTemplate: {
        type: Object,
        required: true,
    },
    selectedTemplates: {
        type: Array,
        required: true,
    },
})

const emit = defineEmits(['close', 'saveTemplate', 'refreshDraftTemplates'])
const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formTemplate: {
        id: '',
        uuid: '',
        name: '',
        recurring: {
            is_recurring: false,
            week_rotations: '',
        },
    },
})

function closeModal() {
    state.error = {}
    state.isPageLoading = false
    emit('close')
}

function refreshDraftTemplates() {
    emit('refreshDraftTemplates')
}

async function applyTemplate(applyDetails: any) {
    state.error = {}
    state.isPageLoading = true

    try {
        const params = {
           weeks: applyDetails.weeks,
           years: applyDetails.years,
           template_uuids: props.selectedTemplates.map((template: any) => template.uuid),
        } as any

        const response = await draftTemplateService.applyDraftTemplate(params)
        if (response?.data) {
            refreshDraftTemplates()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('events.alert.successfullyAdded')}.`)
        }
    } catch (error: any) {
        state.error = error
    } finally {
        state.isPageLoading = false
    }
}
</script>