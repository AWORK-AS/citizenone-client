<template>
    <Modal size="sm" :title="$t('surveys.changeCompletedDate')" :show="props.isModalOpen" @close="emit('close')">
        <template #modal-body>
            <div class="space-y-5">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <p class="text-sm text-gray-600">{{ props.assignment?.survey?.title }}</p>
                <div class="space-y-1">
                    <FormLabel for="survey_completed_at" :label="$t('surveys.completedDate')" />
                    <FormDateField v-if="props.isModalOpen" id="survey_completed_at" name="survey_completed_at"
                        :placeholder="$t('surveys.completedDate')" :maxDate="today" v-model="state.date" />
                    <FormError :error="state.error?.errors?.completed_at?.[0]" />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormButton type="button" buttonStyle="cancel" @click="emit('close')">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton type="button" buttonStyle="primary" :disabled="!state.date || state.isSaving"
                        @click="save">
                        {{ $t('save') }}
                    </FormButton>
                </div>
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useI18n } from 'vue-i18n'
import { surveyService } from '@/components/api/user/SurveyService'
import { useAlert } from '@/composables/alert'

// Moves the day an answered survey counts as answered, e.g. a paper survey
// from a consultation that was typed in later. The answers are not touched.
const props = defineProps({
    isModalOpen: { type: Boolean, default: false },
    assignment: { type: Object as any, default: null },
    // For lists of one survey's answers, where the answers may not carry the survey.
    surveyUuid: { type: String, default: '' },
})
const emit = defineEmits(['close', 'saved'])

const { t } = useI18n()
const { successAlert } = useAlert()
const today = moment().format('YYYY-MM-DD')

const state = reactive({
    date: '',
    error: {} as any,
    isSaving: false,
})

watch(() => props.isModalOpen, (open: boolean) => {
    if (!open) return
    state.error = {}
    state.date = props.assignment?.completed_at ? moment(props.assignment.completed_at).format('YYYY-MM-DD') : today
})

async function save() {
    state.error = {}
    state.isSaving = true
    try {
        const response = await surveyService.updateAssignmentCompletedDate(
            props.surveyUuid || props.assignment?.survey?.uuid, props.assignment?.uuid, { completed_at: state.date })
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, `${t('surveys.alert.completedDateChanged')}.`)
            emit('saved', response.data)
        }
    } catch (error: any) { state.error = error }
    state.isSaving = false
}
</script>
