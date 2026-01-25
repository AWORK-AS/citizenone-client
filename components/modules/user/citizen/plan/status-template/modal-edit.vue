<template>
    <div>
        <Modal size="xl" :title="$t('plansandgoals.editStatusTemplate.editReport')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    
                    <div v-if="state.currentStep === 1" class="space-y-5">
                        <div class="px-4 py-6 sm:p-8 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
                            <div class="space-y-3">
                                <div class="space-y-1">
                                    <div class="flex justify-between items-center py-0.5">
                                        <FormLabel for="form" :label="$t('citizens.documents.createTemplate.form.form')" />
                                        <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                                            @click="navigateTo('/forms')">
                                            {{ $t('citizens.documents.createTemplate.form.createNewForm') }}
                                        </span>
                                    </div>
                                    <FormSelect id="form" :options="state.options.forms"
                                        v-model="state.formStatusTemplate.form_uuid" />
                                    <FormError :error="v$?.formStatusTemplate?.form_uuid?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.form_uuid?.[0]" />
                                </div>
                                <div class="grid md:grid-cols-3 gap-x-3">
                                    <div class="space-y-1">
                                        <FormLabel for="journal_note_plan" :label="$t('citizens.documents.createTemplate.form.plan')" />
                                        <FormSelect id="journal_note_plan" :options="state.options.plans"
                                            v-model="state.formStatusTemplate.plan_uuid"
                                            @change="(planUuid: any) => fetchAllGoalsPerPlan(planUuid)" />
                                        <FormError :error="v$?.formStatusTemplate?.plan_uuid?.$errors[0]?.$message.toString()" />
                                    </div>
                                    <div class="space-y-1">
                                        <FormLabel for="journal_note_goal" :label="$t('citizens.documents.createTemplate.form.goal')" />
                                        <FormSelect id="journal_note_goal" :options="state.options.goals"
                                            v-model="state.formStatusTemplate.goal_uuid"
                                            @change="(goalUuid: any) => fetchAllSubgoalsPerGoal(goalUuid)" />
                                    </div>
                                    <div class="space-y-1">
                                        <FormLabel for="journal_note_subgoals" :label="$t('citizens.documents.createTemplate.form.subgoal')" />
                                        <FormSelect id="journal_note_subgoals" :options="state.options.subgoals"
                                            v-model="state.formStatusTemplate.subgoal_uuid" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" @click="closeModal()">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="primary" @click="proceedToStep2">
                                {{ $t('proceed') }}
                            </FormButton>
                        </div>
                    </div>

                    
                    <div v-else class="space-y-5">
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
                                                    <!-- TEXTFIELD -->
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
                                                                            class="text-red-600">*</span>
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
                                                                            class="text-red-600">*</span>
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
                                                                            class="text-red-600">*</span>
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
                                                                            class="text-red-600">*</span>
                                                                    </h3>
                                                                    <div class="space-y-3">
                                                                        <div v-for="(radio, radioIndex) in JSON.parse(formField?.field)?.options"
                                                                            :key="radioIndex"
                                                                            class="flex items-center gap-x-2">
                                                                            <label class="flex items-center gap-x-2 cursor-pointer">
                                                                                <FormRadioButton
                                                                                    :name="`choice_${fieldIndex}`"
                                                                                    :value="radio"
                                                                                    :checked="formField.responses === radio"
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
                                                                            class="text-red-600">*</span>
                                                                    </h3>
                                                                    <div class="space-y-3">
                                                                        <div v-for="(checkbox, checkboxIndex) in JSON.parse(formField?.field)?.options"
                                                                            :key="checkboxIndex"
                                                                            class="flex items-center gap-x-2">
                                                                            <label class="flex items-center gap-x-2 cursor-pointer">
                                                                                <FormCheckbox
                                                                                    :name="`choice_${fieldIndex}_${checkboxIndex}`"
                                                                                    :checked="formField.responses?.includes(checkbox)"
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
                                                                            class="text-red-600">*</span>
                                                                    </h3>
                                                                    <div class="flex items-center justify-between gap-x-2">
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
                                                        <div class="p-5 space-y-3">
                                                            <div class="flex gap-x-3">
                                                                <div>{{ fieldIndex + 1 }}.</div>
                                                                <div class="grow space-y-4">
                                                                    <h3>
                                                                        {{ JSON.parse(formField?.field)?.value }}
                                                                        <span
                                                                            v-if="JSON.parse(formField?.field)?.required"
                                                                            class="text-red-600">*</span>
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
                            <div class="mt-2 flex justify-center gap-3">
                                <FormButton type="button" buttonStyle="link" class="rounded-md" @click="closeModal()">
                                    {{ $t('cancel') }}
                                </FormButton>
                            </div>
                        </div>
                    </div>
                </LoadingSpinner>
            </template>
        </Modal>

        <DialogConfirmation
            :isModalOpen="state.modal.isFormChangeWarningOpen"
            :message="$t('plansandgoals.editStatusTemplate.formChangeWarning')"
            @close="cancelFormChange"
            @confirm="confirmFormChange" />
    </div>
</template>

<script setup lang="ts">
import { formService } from '@/components/api/user/FormService'
import { formFieldService } from '~/components/api/user/FormFieldService'
import { planGoalSubgoalService } from '@/components/api/user/PlanGoalSubgoalService'
import { planService } from '@/components/api/user/PlanService'
import { goalService } from '@/components/api/user/GoalService'
import { subgoalService } from '@/components/api/user/SubgoalService'
import { useI18n } from "vue-i18n"
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'
import { saveAs } from 'file-saver'

const emit = defineEmits(['close', 'refreshData'])
const { t } = useI18n()
const { successAlert } = useAlert()
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedStatus: {
        type: Object,
        required: true,
    },
    selectedData: {
        type: Object,
        default: null,
    },
})

const state = reactive({
    error: {} as Error,
    form: [] as any,
    isPageLoading: false,
    isDraft: true,

    currentStep: 1,
    formStatusTemplate: {  
        form_uuid: '',
        plan_uuid: '',
        goal_uuid: '',
        subgoal_uuid: '',
    },
    options: {
        forms: [],
        plans: [],
        goals: [],
        subgoals: [],
    },
    modal: {
        isFormChangeWarningOpen: false,
    },
})

const rules = computed(() => {
    return {
        formStatusTemplate: {
            form_uuid: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            plan_uuid: !(state.formStatusTemplate.goal_uuid || state.formStatusTemplate.subgoal_uuid) ? {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            } : {},
        },
    }
})

const v$ = useVuelidate(rules, state)

function closeModal() {
    emit('close')
}

watch(() => props.isModalOpen, async (isModalOpen: any) => {
    if (isModalOpen) {
        state.formStatusTemplate.form_uuid = props.selectedStatus?.form?.uuid || ''
        
        const modelType = props.selectedStatus?.model_type || ''
        const modelUuid = props.selectedStatus?.model?.uuid || ''
        
        state.formStatusTemplate.plan_uuid = ''
        state.formStatusTemplate.goal_uuid = ''
        state.formStatusTemplate.subgoal_uuid = ''
        
        if (modelType.includes('CitizenPlan')) {
            state.formStatusTemplate.plan_uuid = modelUuid
        } else if (modelType.includes('CitizenGoal')) {
            state.formStatusTemplate.goal_uuid = modelUuid
        } else if (modelType.includes('CitizenSubgoal')) {
            state.formStatusTemplate.subgoal_uuid = modelUuid
        }

        await fetchAllForms()
        await fetchAllPlans()

        if (state.formStatusTemplate.plan_uuid) {
            const savedGoalUuid = state.formStatusTemplate.goal_uuid
            const savedSubgoalUuid = state.formStatusTemplate.subgoal_uuid
            await fetchAllGoalsPerPlan(state.formStatusTemplate.plan_uuid)
            state.formStatusTemplate.goal_uuid = savedGoalUuid
            state.formStatusTemplate.subgoal_uuid = savedSubgoalUuid
        }
        if (state.formStatusTemplate.goal_uuid) {
            await fetchAllSubgoalsPerGoal(state.formStatusTemplate.goal_uuid)
        }

        state.currentStep = 1
    }
})

async function fetchForm() {
    state.error = {}
    state.isPageLoading = true
    try {
        const formUuid = props.selectedStatus?.form?.uuid
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

async function fetchDraftData() {
    if (!props.selectedStatus?.uuid) return

    try {
        const response = await planGoalSubgoalService.getAttachmentDetails(props.selectedStatus.uuid)
        if (response?.data?.field_responses) {
            response.data.field_responses.forEach((fieldResponse: any) => {
                const fieldIndex = state.form.data.form_fields.findIndex(
                    (f: any) => f.uuid === fieldResponse.form_field_uuid
                )
                if (fieldIndex !== -1) {
                    const fieldType = JSON.parse(state.form.data.form_fields[fieldIndex].field)?.type
                    if (fieldType === 'checkbox') {
                        state.form.data.form_fields[fieldIndex].responses = JSON.parse(fieldResponse.response || '[]')
                    } else {
                        state.form.data.form_fields[fieldIndex].responses = fieldResponse.response
                    }
                }
            })
        }
    } catch (error) {
        console.error('Failed to fetch draft details:', error)
    }
}

async function fetchAllForms() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await formService.getAllForms()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (form: any) => options.push({
                    value: form?.uuid,
                    label: form?.title,
                })
            )
            state.options.forms = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchAllPlans() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await planService.getAllPlans(citizenUuid)
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (plan: any) => options.push({
                    value: plan?.uuid,
                    label: plan?.name,
                })
            )
            state.options.plans = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchAllGoals() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await goalService.getAllGoalsPerCitizen(citizenUuid)
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (goal: any) => options.push({
                    value: goal?.uuid,
                    label: goal?.name,
                })
            )
            state.options.goals = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchAllGoalsPerPlan(planUuid: any) {
    if (planUuid) {
        state.formStatusTemplate.goal_uuid = ''
        state.formStatusTemplate.subgoal_uuid = ''
        state.options.goals = []
        state.options.subgoals = []
        state.error = {}
        state.isPageLoading = true
        try {
            const response = await goalService.getAllGoalsPerPlan(planUuid)
            if (response.data) {
                let options: any = []
                response.data.forEach(
                    (goal: any) => options.push({
                        value: goal?.uuid,
                        label: goal?.name,
                    })
                )
                state.options.goals = options
            }
        } catch (error: any) {
            state.error = error
        }
        state.isPageLoading = false
    } else {
        fetchAllGoals()
        state.formStatusTemplate.goal_uuid = ''
        state.formStatusTemplate.subgoal_uuid = ''
        state.options.goals = []
        state.options.subgoals = []
    }
}

async function fetchAllSubgoalsPerGoal(goalUuid: any) {
    if (goalUuid) {
        state.error = {}
        state.isPageLoading = true
        try {
            const response = await subgoalService.getAllSubgoals(goalUuid)
            if (response.data) {
                let options: any = []
                response.data.forEach(
                    (subgoal: any) => options.push({
                        value: subgoal?.uuid,
                        label: subgoal?.name,
                    })
                )
                state.options.subgoals = options
            }
        } catch (error: any) {
            state.error = error
        }
        state.isPageLoading = false
    } else {
        state.formStatusTemplate.subgoal_uuid = ''
        state.options.subgoals = []
    }
}

async function proceedToStep2() {
    v$.value.$validate()
    
    if (!v$.value.$error) {
        const formChanged = state.formStatusTemplate.form_uuid !== props.selectedStatus?.form?.uuid

        if (formChanged) {
            state.modal.isFormChangeWarningOpen = true
            return
        }

        await fetchForm()
        await fetchDraftData()
        state.currentStep = 2
    }
}

async function confirmFormChange() {
    state.modal.isFormChangeWarningOpen = false
    await fetchFormByUuid(state.formStatusTemplate.form_uuid)
    state.currentStep = 2
}

function cancelFormChange() {
    state.modal.isFormChangeWarningOpen = false
    state.formStatusTemplate.form_uuid = props.selectedStatus?.form?.uuid || ''
}

function backToStep1() {
    state.currentStep = 1
}

async function fetchFormByUuid(formUuid: string) {
    state.error = {}
    state.isPageLoading = true
    try {
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
        params.append('is_draft', state.isDraft ? '1' : '0')
        params.append('form_uuid', state.formStatusTemplate.form_uuid || props.selectedStatus?.form?.uuid || state.form?.data?.uuid)

        state.form.data.form_fields.forEach((formField: any) => {
            const fieldType = JSON.parse(formField.field)?.type
            const fieldUuid = formField.uuid

            if (fieldType === 'uploadfile' && formField.responses instanceof File) {
                params.append(`responses[${fieldUuid}]`, formField.responses, formField.responses.name)
            } else if (Array.isArray(formField.responses)) {
                params.append(`responses[${fieldUuid}]`, JSON.stringify(formField.responses))
            } else {
                params.append(`responses[${fieldUuid}]`, formField.responses)
            }
        })

        const response = await formFieldService.updateAttachmentResponses(
            props.selectedStatus.uuid,
            params
        )

        if (response) {
            successAlert(`${t('alert.success')}!`, `${t('plansandgoals.editStatusTemplate.alert.statusTemplateSuccessfullyUpdated')}.`)
            emit('refreshData')
            closeModal()
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
        params.append('is_draft', state.isDraft ? '1' : '0')
        params.append('form_uuid', state.formStatusTemplate.form_uuid || props.selectedStatus?.form?.uuid || state.form?.data?.uuid)
        params.append('download_pdf', '1')

        state.form.data.form_fields.forEach((formField: any) => {
            const fieldType = JSON.parse(formField.field)?.type
            const fieldUuid = formField.uuid

            if (fieldType === 'uploadfile' && formField.responses instanceof File) {
                params.append(`responses[${fieldUuid}]`, formField.responses, formField.responses.name)
            } else if (Array.isArray(formField.responses)) {
                params.append(`responses[${fieldUuid}]`, JSON.stringify(formField.responses))
            } else {
                params.append(`responses[${fieldUuid}]`, formField.responses)
            }
        })

        const response = await formFieldService.updateAttachmentResponses(
            props.selectedStatus.uuid,
            params
        )

        if (response) {
            successAlert(`${t('alert.success')}!`, `${t('plansandgoals.editStatusTemplate.alert.statusTemplateSuccessfullyUpdated')}.`)
            emit('refreshData')
            closeModal()
            const filename = state.form?.data?.document_title || state.form?.data?.title || 'download'
            saveAs(response, `${filename}.pdf`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

</script>