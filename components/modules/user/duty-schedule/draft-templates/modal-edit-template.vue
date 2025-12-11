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
        recurring: {
            is_recurring: false,
            recurring: '',
            recurring_until: '',
            frequency: '',
            every: '',
            weekly_on: [],
            monthly_on_the_enabled: false,
            monthly_each: [],
            monthly_on_the_sequence: '',
            monthly_on_the_day: '',
            yearly_in_months: [],
            yearly_on_the_enabled: false,
            yearly_on_the_sequence: '',
            yearly_on_the_day: '',
            is_apply_to_all: false,
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
            state.formTemplate.recurring.recurring = response.data.recurring
            state.formTemplate.recurring.recurring_until = response.data.recurring_until

            if (response.data.recurring === 'custom') {
                state.formTemplate.recurring.frequency = response.data.recurring_rules.frequency
                state.formTemplate.recurring.every = response.data.recurring_rules.every
                if (response.data.recurring_rules.frequency === 'weekly') {
                    state.formTemplate.recurring.weekly_on = response.data.recurring_rules.weekly_on
                } else if (response.data.recurring_rules.frequency === 'monthly') {
                    state.formTemplate.recurring.monthly_on_the_enabled = response.data.recurring_rules.monthly_on_the_enabled
                    state.formTemplate.recurring.monthly_each = response.data.recurring_rules.monthly_each
                    state.formTemplate.recurring.monthly_on_the_sequence = response.data.recurring_rules.monthly_on_the_sequence
                    state.formTemplate.recurring.monthly_on_the_day = response.data.recurring_rules.monthly_on_the_day
                } else if (response.data.recurring_rules.frequency === 'yearly') {
                    state.formTemplate.recurring.yearly_in_months = response.data.recurring_rules.yearly_in_months
                    state.formTemplate.recurring.yearly_on_the_enabled = response.data.recurring_rules.yearly_on_the_enabled
                    state.formTemplate.recurring.yearly_on_the_sequence = response.data.recurring_rules.yearly_on_the_sequence
                    state.formTemplate.recurring.yearly_on_the_day = response.data.recurring_rules.yearly_on_the_day
                }
            }
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
            is_recurring: draftTemplateDetails.recurring.is_recurring,
            recurring: draftTemplateDetails.recurring.recurring,
            recurring_until: draftTemplateDetails.recurring.recurring_until,
        } as any
        if (draftTemplateDetails.recurring.recurring === 'custom') {
            params.frequency = draftTemplateDetails.recurring.frequency
            params.every = draftTemplateDetails.recurring.every
            if (draftTemplateDetails.recurring.frequency === 'weekly') {
                params.weekly_on = draftTemplateDetails.recurring.weekly_on
            } else if (draftTemplateDetails.recurring.frequency === 'monthly') {
                params.monthly_on_the_enabled = draftTemplateDetails.recurring.monthly_on_the_enabled
                if (!draftTemplateDetails.recurring.monthly_on_the_enabled) {
                    params.monthly_each = draftTemplateDetails.recurring.monthly_each
                } else {
                    params.monthly_on_the_sequence = draftTemplateDetails.recurring.monthly_on_the_sequence
                    params.monthly_on_the_day = draftTemplateDetails.recurring.monthly_on_the_day
                }
            } else if (draftTemplateDetails.recurring.frequency === 'yearly') {
                params.yearly_in_months = draftTemplateDetails.recurring.yearly_in_months
                if (draftTemplateDetails.recurring.yearly_on_the_enabled) {
                    params.yearly_on_the_sequence = draftTemplateDetails.recurring.yearly_on_the_sequence
                    params.yearly_on_the_day = draftTemplateDetails.recurring.yearly_on_the_day
                }
            }
        }

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