<template>
    <div>
        <Modal size="xs" :title="$t('dutySchedules.draftTemplates.newDraft')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserDutyScheduleDraftTemplatesNewTemplateForm formType="create"
                        :selected-draft-template="state.formTemplate"
                        :error="state.error"
                        @is-loading="setLoading"
                        @closeModal="closeModal"
                        @submitForm="saveTemplate" />
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
})

const emit = defineEmits(['close', 'saveTemplate', 'refreshDraftTemplates'])
const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formTemplate: {
        id: '',
        uuid: '',
        name: '',
        departments: [] as Array<any>,
        is_admin_only: false,
        recurring: {
            is_recurring: false,
            week_rotations: '',
        },
    }
})

function closeModal() {
    emit('close')
}

function refreshDraftTemplates() {
    emit('refreshDraftTemplates')
}

function setLoading(value: boolean) {
    state.isPageLoading = value
}

async function saveTemplate(draftTemplateDetails: any) {
    state.error = {}
    state.isPageLoading = true

    try {
        const params = {
            name: draftTemplateDetails.name,
            is_admin_only: draftTemplateDetails.is_admin_only,
            department_uuid: draftTemplateDetails.department_uuid,
            is_recurring: draftTemplateDetails.recurring.is_recurring,
            week_rotations: draftTemplateDetails.recurring.week_rotations,
        } as any

        const response = await draftTemplateService.saveDraftTemplate(params)
        if (response?.data) {
            refreshDraftTemplates()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('events.alert.successfullyAdded')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
}
</script>