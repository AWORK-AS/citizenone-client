<template>
    <div>
        <Modal size="xl" :title="$t('plansandgoals.createStatusTemplate.createReport')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="space-y-5">
                        <div class="space-y-3 px-4 py-6 sm:p-8 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
                            <Alert type="danger" :text="state?.error?.message"
                                v-if="state.error?.message && state.error.message.length > 0" />
                            <h3 class="text-lg font-semibold">
                                {{ state.form?.data?.title }}
                            </h3>
                            <p class="text-sm">
                                {{ state.form?.data?.description }}
                            </p>

                            <div class="space-y-3">
                                <div>
                                    <div class="space-y-8 mt-5" v-if="state.form?.data?.form_fields?.length > 0">
                                        <div v-for="(formField, fieldIndex) in state.form?.data?.form_fields"
                                            :key="fieldIndex" class="space-y-3">
                                            <div class="bg-gray-100 rounded-md border-t-2 border-primary">
                                                <div>
                                                    <div v-if="JSON.parse(formField?.field)?.type === 'textfield'"
                                                        class="grow">
                                                        <div class="p-5 space-y-3">
                                                            <div class="flex gap-x-3">
                                                                <div>{{ fieldIndex + 1 }}.</div>
                                                                <div class="grow space-y-3">
                                                                    <h3>
                                                                        {{ JSON.parse(formField?.field)?.value }}
                                                                        <span
                                                                            v-if="JSON.parse(formField?.field)?.required"
                                                                            class="text-red-600">
                                                                            *
                                                                        </span>
                                                                    </h3>
                                                                    <FormTextField :name="'text_field_' + fieldIndex"
                                                                        placeholder="Enter your answer"
                                                                        v-model="formField.responses" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div v-if="JSON.parse(formField?.field)?.type === 'textarea'"
                                                        class="grow">
                                                        <div class="p-5 space-y-3">
                                                            <div class="flex gap-x-3">
                                                                <div>{{ fieldIndex + 1 }}.</div>
                                                                <div class="grow space-y-3">
                                                                    <h3>
                                                                        {{ JSON.parse(formField?.field)?.value }}
                                                                        <span
                                                                            v-if="JSON.parse(formField?.field)?.required"
                                                                            class="text-red-600">
                                                                            *
                                                                        </span>
                                                                    </h3>
                                                                    <FormTextArea :name="'textarea_' + fieldIndex"
                                                                        placeholder="Enter your answer"
                                                                        v-model="formField.responses" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div v-if="JSON.parse(formField?.field)?.type === 'datefield'"
                                                        class="grow">
                                                        <div class="p-5 space-y-3">
                                                            <div class="flex gap-x-3">
                                                                <div>{{ fieldIndex + 1 }}.</div>
                                                                <div class="grow space-y-3">
                                                                    <h3>
                                                                        {{ JSON.parse(formField?.field)?.value }}
                                                                        <span
                                                                            v-if="JSON.parse(formField?.field)?.required"
                                                                            class="text-red-600">
                                                                            *
                                                                        </span>
                                                                    </h3>
                                                                    <div class="relative">
                                                                        <FormDateField
                                                                            :name="'date_field_' + fieldIndex"
                                                                            placeholder="Enter your answer"
                                                                            v-model="formField.responses" />
                                                                        <Icon name="ph:calendar"
                                                                            class="h-5 w-5 absolute right-4 top-2.5 text-gray-500"
                                                                            aria-hidden="true" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div v-if="JSON.parse(formField?.field)?.type === 'choice'"
                                                        class="grow">
                                                        <div class="p-5 space-y-3">
                                                            <div class="flex gap-x-3">
                                                                <div>{{ fieldIndex + 1 }}.</div>
                                                                <div class="grow space-y-3">
                                                                    <h3>
                                                                        {{ JSON.parse(formField?.field)?.value }}
                                                                        <span
                                                                            v-if="JSON.parse(formField?.field)?.required"
                                                                            class="text-red-600">
                                                                            *
                                                                        </span>
                                                                    </h3>
                                                                    <div class="space-y-3">
                                                                        <div v-for="(radio, radioIndex) in JSON.parse(formField?.field)?.options"
                                                                            :key="radioIndex"
                                                                            class="flex items-center gap-x-2">
                                                                            <label
                                                                                class="flex items-center gap-x-2 cursor-pointer">
                                                                                <FormRadioButton
                                                                                    :name="`choice_${fieldIndex}`"
                                                                                    :value="radio"
                                                                                    @change="changeRadioButton(fieldIndex, $event)" />
                                                                                <h3>{{ radio }}</h3>
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div v-if="JSON.parse(formField?.field)?.type === 'checkbox'"
                                                        class="grow">
                                                        <div class="p-5 space-y-3">
                                                            <div class="flex gap-x-3">
                                                                <div>{{ fieldIndex + 1 }}.</div>
                                                                <div class="grow space-y-3">
                                                                    <h3>{{ JSON.parse(formField?.field)?.value }}
                                                                        <span
                                                                            v-if="JSON.parse(formField?.field)?.required"
                                                                            class="text-red-600">
                                                                            *
                                                                        </span>
                                                                    </h3>
                                                                    <div class="space-y-3">
                                                                        <div v-for="(checkbox, checkboxIndex) in JSON.parse(formField?.field)?.options"
                                                                            :key="checkboxIndex"
                                                                            class="flex items-center gap-x-2">
                                                                            <label
                                                                                class="flex items-center gap-x-2 cursor-pointer">
                                                                                <FormCheckbox
                                                                                    :name="`choice_${fieldIndex}_${checkboxIndex}`"
                                                                                    @change="changeCheckbox(fieldIndex, checkbox)" />
                                                                                <h3>{{ checkbox }}</h3>
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div v-if="JSON.parse(formField?.field)?.type === 'rating'"
                                                        class="grow">
                                                        <div class="p-5 space-y-3">
                                                            <div class="flex gap-x-3">
                                                                <div>{{ fieldIndex + 1 }}.</div>
                                                                <div class="grow space-y-3">
                                                                    <h3>
                                                                        {{ JSON.parse(formField?.field)?.value }}
                                                                        <span
                                                                            v-if="JSON.parse(formField?.field)?.required"
                                                                            class="text-red-600">
                                                                            *
                                                                        </span>
                                                                    </h3>
                                                                    <div
                                                                        class="flex items-center justify-between gap-x-2">
                                                                        <button
                                                                            v-for="(rating, ratingIndex) in JSON.parse(formField?.field)?.levels"
                                                                            :key="ratingIndex"
                                                                            class="w-full h-10 flex items-center justify-center border border-gray-300 rounded-sm"
                                                                            :class="formField.responses === rating && 'bg-primary text-white'"
                                                                            @click="changeRating(fieldIndex, rating)">
                                                                            {{ rating }}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div v-if="JSON.parse(formField?.field)?.type === 'uploadfile'"
                                                        class="grow">
                                                        <div>
                                                            <div class="p-5 space-y-3">
                                                                <div class="flex gap-x-3">
                                                                    <div>{{ fieldIndex + 1 }}.</div>
                                                                    <div class="grow space-y-4">
                                                                        <h3>
                                                                            {{ JSON.parse(formField?.field)?.value }}
                                                                            <span
                                                                                v-if="JSON.parse(formField?.field)?.required"
                                                                                class="text-red-600">
                                                                                *
                                                                            </span>
                                                                        </h3>
                                                                        <input type="file"
                                                                            @change="onFileChange(fieldIndex, $event)">
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div v-if="state.form?.data?.is_follow_up_enabled" class="space-y-3">
                            <div class="w-fit flex items-center cursor-pointer"
                                @click="state.useFollowUpReminder = !state.useFollowUpReminder">
                                <FormCheckbox id="use_follow_up_reminder" :value="state.useFollowUpReminder" />
                                {{ $t('plansandgoals.createStatusTemplate.form.useFollowUpReminder') }}
                            </div>

                            <div v-if="state.useFollowUpReminder" class="space-y-2 pl-6">
                                <label class="text-sm font-medium text-gray-700">
                                    {{ $t('plansandgoals.createStatusTemplate.form.setFollowUpDate') }}
                                </label>
                                <div class="flex items-center gap-x-3">
                                    <span class="text-sm text-gray-600">
                                        {{ $t('plansandgoals.createStatusTemplate.form.followUpIn') }}
                                    </span>
                                    <div class="w-24">
                                        <FormNumberField
                                            name="follow_up_number"
                                            placeholder="1"
                                            v-model="state.followUpNumber"
                                        />
                                    </div>
                                    <div class="w-40">
                                        <FormSelect
                                            id="follow_up_unit"
                                            :options="followUpUnits"
                                            :canClear="false"
                                            :searchable="false"
                                            v-model="state.followUpUnit"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="space-y-1">
                            <div class="w-fit flex items-center cursor-pointer"
                                @click="state.isDraft = !state.isDraft">
                                <FormCheckbox id="is_draft" :value="state.isDraft" />
                                {{ $t('plansandgoals.createStatusTemplate.form.saveAsDraft') }}
                            </div>
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="primary" class="rounded-md"
                                    @click="submitResponse">
                                    {{ $t('save') }}
                                </FormButton>
                                <FormButton type="button" buttonStyle="primary" class="rounded-md"
                                    @click="submitResponseAndDownloadPDF">
                                    {{ $t('plansandgoals.createStatusTemplate.form.saveAndDownload') }}
                                </FormButton>
                            </div>
                            <div class="mt-2 flex justify-center">
                                <FormButton type="button" buttonStyle="link" class="rounded-md" @click="closeModal()">
                                    {{ $t('cancel') }}
                                </FormButton>
                            </div>
                        </div>
                    </div>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { formService } from '@/components/api/user/FormService'
import { formFieldService } from '@/components/api/user/FormFieldService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'
import { saveAs } from 'file-saver'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectFormStatusTemplate: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'closeModalNew'])
const { t } = useI18n()
const { successAlert } = useAlert()

const state = reactive({
    error: {} as Error,
    form: [] as any,
    isPageLoading: false,
    isDraft: false,
    useFollowUpReminder: false,
    followUpNumber: '1',
    followUpUnit: 'days',
})

const followUpUnits = [
    { value: 'days', label: t('plansandgoals.createStatusTemplate.form.days') },
    { value: 'weeks', label: t('plansandgoals.createStatusTemplate.form.weeks') },
    { value: 'months', label: t('plansandgoals.createStatusTemplate.form.months') },
    { value: 'years', label: t('plansandgoals.createStatusTemplate.form.years') },
]

function calculateFollowUpDate(){
    return `${state.followUpNumber} ${state.followUpUnit}`
}

function closeModal() {
    emit('close')
}

function closeModalNew() {
    emit('closeModalNew')
}

watch(() => props.isModalOpen, (isModalOpen: any) => {
    if (isModalOpen) {
        fetchForm()
    }
})

async function fetchForm() {
    state.error = {}
    state.isPageLoading = true
    try {
        const formUuid = props.selectFormStatusTemplate?.form_uuid
        const response = await formService.getForm(formUuid)
        if (response) {
            if (response.data?.form_fields) {
                response.data.form_fields = response.data.form_fields.map((field: any) => ({
                    ...field,
                    responses: JSON.parse(field?.field)?.type === 'checkbox' ? [] : ""
                }))
            }
            state.form = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function changeRadioButton(fieldIndex: number, event: Event) {
    const target = event.target as HTMLInputElement
    state.form.data.form_fields[fieldIndex].responses = target.value
}

function changeCheckbox(fieldIndex: number, checkbox: string) {
    const responses = state.form.data.form_fields[fieldIndex].responses
    const index = responses.indexOf(checkbox)
    if (index === -1) {
        responses.push(checkbox)
    } else {
        responses.splice(index, 1)
    }
}

function changeRating(fieldIndex: number, rating: number) {
    state.form.data.form_fields[fieldIndex].responses = rating
}

function onFileChange(fieldIndex: number, event: any) {
    const file = event.target.files[0]
    state.form.data.form_fields[fieldIndex].responses = file
}

async function submitResponse() {
    state.error = {}
    state.isPageLoading = true
    try {
        let params = new FormData()
        params.append('form_uuid', props.selectFormStatusTemplate?.form_uuid.toString())
        if (props.selectFormStatusTemplate.subgoal_uuid) {
            params.append('plan_goal_subgoal_uuid', props.selectFormStatusTemplate.subgoal_uuid.toString())
        } else if (props.selectFormStatusTemplate.goal_uuid) {
            params.append('plan_goal_subgoal_uuid', props.selectFormStatusTemplate.goal_uuid.toString())
        } else {
            params.append('plan_goal_subgoal_uuid', props.selectFormStatusTemplate.plan_uuid.toString())
        }
        params.append('is_draft', state.isDraft ? '1' : '0')

        if (state.useFollowUpReminder) {
            const followUpDate = calculateFollowUpDate()
            if (followUpDate) {
                params.append('follow_up_date', followUpDate)
            }
        }

        state.form.data.form_fields.forEach((formField: any) => {
            const fieldType = JSON.parse(formField.field)?.type
            const fieldUuid = formField.uuid

            if (fieldType === 'uploadfile' && formField.responses instanceof File) {
                // Handle file uploads separately
                params.append(`responses[${fieldUuid}]`, formField.responses, formField.responses.name)
            } else if (Array.isArray(formField.responses)) {
                // Handle checkboxes, which are arrays
                params.append(`responses[${fieldUuid}]`, JSON.stringify(formField.responses))
            } else {
                // Handle other field types (text, date, rating, etc.)
                params.append(`responses[${fieldUuid}]`, formField.responses)
            }
        })
        const response = await formFieldService.saveResponses(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('plansandgoals.createStatusTemplate.alert.statusTemplateSuccessfullyAdded')}.`)
            closeModal()
            closeModalNew()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function submitResponseAndDownloadPDF() {
    state.error = {}
    state.isPageLoading = true
    try {
        let params = new FormData()
        params.append('form_uuid', props.selectFormStatusTemplate?.form_uuid.toString())
        if (props.selectFormStatusTemplate.subgoal_uuid) {
            params.append('plan_goal_subgoal_uuid', props.selectFormStatusTemplate.subgoal_uuid.toString())
        } else if (props.selectFormStatusTemplate.goal_uuid) {
            params.append('plan_goal_subgoal_uuid', props.selectFormStatusTemplate.goal_uuid.toString())
        } else {
            params.append('plan_goal_subgoal_uuid', props.selectFormStatusTemplate.plan_uuid.toString())
        }
        params.append('is_draft', state.isDraft ? '1' : '0')

        if (state.useFollowUpReminder) {
            const followUpDate = calculateFollowUpDate()
            if (followUpDate) {
                params.append('follow_up_date', followUpDate)
            }
        }

        state.form.data.form_fields.forEach((formField: any) => {
            const fieldType = JSON.parse(formField.field)?.type
            const fieldUuid = formField.uuid

            if (fieldType === 'uploadfile' && formField.responses instanceof File) {
                // Handle file uploads separately
                params.append(`responses[${fieldUuid}]`, formField.responses, formField.responses.name)
            } else if (Array.isArray(formField.responses)) {
                // Handle checkboxes, which are arrays
                params.append(`responses[${fieldUuid}]`, JSON.stringify(formField.responses))
            } else {
                // Handle other field types (text, date, rating, etc.)
                params.append(`responses[${fieldUuid}]`, formField.responses)
            }
        })
        const response = await formFieldService.savePlanGoalSubgoalResponsesAndDownloadPDF(params)
        if (response) {
            successAlert(`${t('alert.success')}!`, `${t('plansandgoals.createStatusTemplate.alert.statusTemplateSuccessfullyAdded')}.`)
            closeModal()
            closeModalNew()
            const filename = state.form?.data?.document_title || state.form?.data?.title || 'download'
            saveAs(response, `${filename}.pdf`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>