<template>
    <div>
        <Modal size="xl" :title="$t('citizens.documents.createTemplate.createReport')" :show="props.isModalOpen"
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
                            <p v-if="state.useFollowUpReminder && followUpDate" class="ml-6 text-sm text-gray-500">
                                {{ $t('plansandgoals.createStatusTemplate.form.setFollowUpDate') }}:
                                <span class="font-medium text-gray-700">{{ followUpDate }}</span>
                                <span class="ml-1">({{ state.form?.data?.follow_up_duration }})</span>
                            </p>
                        </div>

                        <div class="space-y-1">
                            <div class="w-fit flex items-center cursor-pointer" @click="state.isDraft = !state.isDraft">
                                <FormCheckbox id="is_draft" :value="state.isDraft" />
                                {{ $t('plansandgoals.createStatusTemplate.form.saveAsDraft') }}
                            </div>
                        </div>

                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="primary" @click="submitResponse">
                                    {{ $t('save') }}
                                </FormButton>
                                <FormButton type="button" buttonStyle="primary" @click="submitResponseAndDownloadPDF"
                                    v-if="isAtLeast('Admin')">
                                    {{ $t('citizens.documents.createTemplate.form.saveAndDownload') }}
                                </FormButton>
                            </div>
                            <div class="mt-2 flex justify-center">
                                <FormButton type="button" buttonStyle="link" @click="closeModal()">
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
import { citizenDocumentTemplateService } from '@/components/api/user/CitizenDocumentTemplateService'
import { citizenDocumentStatusService } from '@/components/api/user/CitizenDocumentStatusService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { usePermissions } from '@/composables/usePermissions'
import type { Error } from '@/types'
import { saveAs } from 'file-saver'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedFormStatusTemplate: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'closeModalNew', 'refreshDocuments'])
const { t } = useI18n()
const { successAlert } = useAlert()

const state = reactive({
    error: {} as Error,
    form: [] as any,
    isPageLoading: false,
    isDraft: false,
    useFollowUpReminder: false,
})

const { formatDateToReadable } = useDatetimeFormatter()
const { isAtLeast } = usePermissions()

const followUpDate = computed(() => {
    const duration = state.form?.data?.follow_up_duration
    if (!duration) return null
    const parts = duration.split(' ')
    if (parts.length !== 2) return null
    const n = Number(parts[0])
    const unit = parts[1]?.toLowerCase()
    if (!n || !unit) return null
    const date = new Date()
    if (unit === 'days') date.setDate(date.getDate() + n)
    else if (unit === 'weeks') date.setDate(date.getDate() + n * 7)
    else if (unit === 'months') date.setMonth(date.getMonth() + n)
    else if (unit === 'years') date.setFullYear(date.getFullYear() + n)
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    return formatDateToReadable(`${yyyy}-${mm}-${dd}`)
})

function closeModal() {
    emit('close')
}

function closeModalNew() {
    emit('closeModalNew')
}

function refreshDocuments() {
    emit('refreshDocuments')
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
        const formUuid = props.selectedFormStatusTemplate?.form_uuid
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
        params.append('folder_uuid', props.selectedFormStatusTemplate?.folder_uuid?.toString())
        params.append('form_uuid', props.selectedFormStatusTemplate?.form_uuid?.toString())
        if (props.selectedFormStatusTemplate.subgoal_uuid) {
            params.append('plan_goal_subgoal_uuid', props.selectedFormStatusTemplate.subgoal_uuid?.toString())
        } else if (props.selectedFormStatusTemplate.goal_uuid) {
            params.append('plan_goal_subgoal_uuid', props.selectedFormStatusTemplate.goal_uuid?.toString())
        } else if (props.selectedFormStatusTemplate.plan_uuid) {
            params.append('plan_goal_subgoal_uuid', props.selectedFormStatusTemplate.plan_uuid?.toString())
        }
        params.append('is_draft', state.isDraft ? '1' : '0')

        if (state.useFollowUpReminder) {
            params.append('use_follow_up_date', '1')
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
        const response = await citizenDocumentTemplateService.saveDocumentResponses(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('citizens.documents.createTemplate.alert.templateSuccessfullyAdded')}.`)
            closeModal()
            closeModalNew()
            refreshDocuments()
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
        params.append('folder_uuid', props.selectedFormStatusTemplate?.folder_uuid?.toString())
        params.append('form_uuid', props.selectedFormStatusTemplate?.form_uuid?.toString())
        if (props.selectedFormStatusTemplate.subgoal_uuid) {
            params.append('plan_goal_subgoal_uuid', props.selectedFormStatusTemplate.subgoal_uuid?.toString())
        } else if (props.selectedFormStatusTemplate.goal_uuid) {
            params.append('plan_goal_subgoal_uuid', props.selectedFormStatusTemplate.goal_uuid?.toString())
        } else if (props.selectedFormStatusTemplate.plan_uuid) {
            params.append('plan_goal_subgoal_uuid', props.selectedFormStatusTemplate.plan_uuid?.toString())
        }
        params.append('is_draft', state.isDraft ? '1' : '0')

        if (state.useFollowUpReminder) {
            params.append('use_follow_up_date', '1')
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
        const response = await citizenDocumentTemplateService.saveDocumentResponsesAndDownloadPDF(params)
        if (response) {
            successAlert(`${t('alert.success')}!`, `${t('citizens.documents.createTemplate.alert.templateSuccessfullyAdded')}.`)
            closeModal()
            closeModalNew()
            refreshDocuments()
            saveAs(response)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>