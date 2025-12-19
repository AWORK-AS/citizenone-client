<template>
    <div>
        <Modal size="xs" :title="$t('dutySchedules.draftTemplates.editDraft')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserDutyScheduleDraftTemplatesNewTemplateForm formType="update"
                        :selected-draft-template="state.formTemplate"
                        :error="state.error"
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
    selectedDraftTemplate: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['close', 'saveTemplate', 'refreshDraftTemplates'])
const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    draftTemplateData: {},
    formTemplate: {
        id: '',
        uuid: '',
        name: '',
        department_uuid: [] as Array<any>,
        is_admin_only: false,
        recurring: {
            is_recurring: false,
            week_rotations: '',
        },
    },
})

function closeModal() {
    emit('close')
}

function refreshDraftTemplates() {
    emit('refreshDraftTemplates')
}

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) {
        fetchDraftTemplate()
        state.draftTemplateData = {}
    }
})

watch(() => props.selectedDraftTemplate, (selectedDraftTemplate: any) => {
    if (selectedDraftTemplate && props.isModalOpen) {
        state.formTemplate = {
            id: selectedDraftTemplate.id,
            uuid: selectedDraftTemplate.uuid,
            name: selectedDraftTemplate.name,
            department_uuid: [...props.selectedDraftTemplate.departments.map((dept: any) => dept.uuid)],
            is_admin_only: selectedDraftTemplate.is_admin_only,
            recurring: {
                is_recurring: selectedDraftTemplate.is_recurring,
                week_rotations: selectedDraftTemplate.week_rotations,
            },
        }
    }
})

async function fetchDraftTemplate() {
    state.error = {}
    state.isPageLoading = true

    try {
        const response = await draftTemplateService.getDraftTemplateDetails(props.selectedDraftTemplate.uuid)
        if (response?.data) {
            state.draftTemplateData = response.data
            state.formTemplate.id = response.data.id
            state.formTemplate.uuid = response.data.uuid
            state.formTemplate.name = response.data.name
            state.formTemplate.recurring.is_recurring = response.data.is_recurring
            state.formTemplate.recurring.week_rotations = response.data.week_rotations
        }
    } catch (error: any) {
        state.error = error
    } finally {
        state.isPageLoading = false
    }
}

async function saveTemplate(draftTemplateDetails: any) {
    state.error = {}
    state.isPageLoading = true

    try {
        const draftTemplateUuid = props.selectedDraftTemplate?.uuid
        const params = {
            name: draftTemplateDetails.name,
            department_uuid: draftTemplateDetails.department_uuid,
            is_admin_only: draftTemplateDetails.is_admin_only,
            is_recurring: draftTemplateDetails.recurring.is_recurring,
            week_rotations: draftTemplateDetails.recurring.week_rotations,
        } as any

        const response = await draftTemplateService.updateDraftTemplate(draftTemplateUuid, params)
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