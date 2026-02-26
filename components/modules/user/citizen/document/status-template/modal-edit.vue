<template>
    <div>
        <Modal size="xl" :title="$t('citizens.documents.createTemplate.createReport')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="submitForm()" id="formTemplate">
                        <div class="space-y-3">
                            <div class="space-y-1">
                                <FormLabel for="form" :label="$t('citizens.documents.createTemplate.form.form')" />
                                <FormSelect id="form" :options="state.options.forms"
                                    v-model="state.formTemplate.form_uuid" />
                                <FormError :error="v$?.formTemplate?.form_uuid?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.form_uuid?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="folder"
                                    :label="$t('citizens.documents.createTemplate.form.folderName')" />
                                <FormSelect id="folder" :options="state.options.folders"
                                    v-model="state.formTemplate.folder_uuid" />
                                <FormError :error="v$?.formTemplate?.folder_uuid?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.folder_uuid?.[0]" />
                            </div>

                            <!-- Uncomment if client want a function to able to move the report to other plan goal or subgoal -->
                            <!-- <div class="grid md:grid-cols-3 gap-x-3">
                                <div class="space-y-1">
                                    <FormLabel for="journal_note_plan"
                                        :label="$t('citizens.documents.createTemplate.form.plan')" />
                                    <FormSelect id="journal_note_plan" :options="state.options.plans"
                                        v-model="state.formTemplate.plan_uuid"
                                        @change="(planUuid: any) => fetchAllGoalsPerPlan(planUuid)" />
                                    <FormError :error="v$?.formTemplate?.plan_uuid?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.plan_uuid?.[0]" />
                                </div>
                                <div class="space-y-1">
                                    <FormLabel for="journal_note_goal"
                                        :label="$t('citizens.documents.createTemplate.form.goal')" />
                                    <FormSelect id="journal_note_goal" :options="state.options.goals"
                                        v-model="state.formTemplate.goal_uuid"
                                        @change="(goalUuid: any) => fetchAllSubgoalsPerGoal(goalUuid)" />
                                    <FormError :error="v$?.formTemplate?.goal_uuid?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.goal_uuid?.[0]" />
                                </div>
                                <div class="space-y-1">
                                    <FormLabel for="journal_note_subgoals"
                                        :label="$t('citizens.documents.createTemplate.form.subgoal')" />
                                    <FormSelect id="journal_note_subgoals" :options="state.options.subgoals"
                                        v-model="state.formTemplate.subgoal_uuid" />
                                    <FormError
                                        :error="v$?.formTemplate?.subgoal_uuid?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.subgoal_uuid?.[0]" />
                                </div>
                            </div> -->
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="closeModal()">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full">
                                    {{ $t('proceed') }}
                                </FormButton>
                            </div>
                        </div>
                    </form>
                </LoadingSpinner>
                <ModulesUserCitizenDocumentStatusTemplateModalEditRespond :isModalOpen="state.modal.isRespondOpen"
                    :selectedFormStatusTemplate="state.formTemplate"
                    :savedResponses="state.documentDetail?.attachment?.field_responses"
                    @close="state.modal.isRespondOpen = false" @closeModalNew="closeModal()"
                    @refreshDocuments="refreshDocuments()" />
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { citizenDocumentService } from '@/components/api/user/CitizenDocumentService'
import { formService } from '@/components/api/user/FormService'
import { planService } from '@/components/api/user/PlanService'
import { goalService } from '@/components/api/user/GoalService'
import { subgoalService } from '@/components/api/user/SubgoalService'
import { useI18n } from "vue-i18n"
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import type { Error } from '@/types'
import { planGoalSubgoalService } from '~/components/api/user/PlanGoalSubgoalService'

const { t } = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedDocument: {
        type: Object,
        required: true
    }
})
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const emit = defineEmits(['close', 'refreshDocuments'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formTemplate: {
        folder_uuid: '',
        form_uuid: '',
        goal_uuid: '',
        plan_uuid: '',
        subgoal_uuid: '',
        attachment_uuid: '',
        current_file_uuid: '',
        is_draft: false,
    },
    modal: {
        isRespondOpen: false,
    },
    options: {
        forms: [],
        folders: [],
        plans: [],
        goals: [],
        subgoals: [],
    },
    documentDetail: {} as any
})

function closeModal() {
    emit('close')
    resetForm()
}

function refreshDocuments() {
    emit('refreshDocuments')
}


function resetForm() {
    state.formTemplate = {
        folder_uuid: '',
        form_uuid: '',
        goal_uuid: '',
        plan_uuid: '',
        subgoal_uuid: '',
        attachment_uuid: '',
        current_file_uuid: '',
        is_draft: false
    }
    v$.value.$reset()
}

watch(() => props.isModalOpen, (isModalOpen: any) => {
    if (isModalOpen) {
        fetchAllFolders()
        fetchAllForms()
        fetchAllPlans()
        fetchFileFolderDetail()
    }
})

const rules = computed(() => {
    return {
        formTemplate: {
            folder_uuid: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            form_uuid: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

async function fetchAllFolders() {
    state.error = {}
    try {
        const response = await citizenDocumentService.getAllFolders(citizenUuid)
        if (response) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.name,
                })
            )
            state.options.folders = options
        }
    } catch (error: any) {
        state.error = error
    }
}

async function fetchFileFolderDetail() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await citizenDocumentService.getCitizenFileDetail(props.selectedDocument.uuid);
        if (response) {
            state.documentDetail = response.data

            state.formTemplate.folder_uuid = state.documentDetail.folder.uuid
            state.formTemplate.attachment_uuid = state.documentDetail?.attachment?.uuid ?? 'null'
            state.formTemplate.current_file_uuid = state.documentDetail.uuid
            state.formTemplate.is_draft = state.documentDetail.is_draft

            if (state.documentDetail.attachment_id) {
                state.formTemplate.form_uuid = state.documentDetail.attachment.form.uuid
                const planGoalSubgoal = await planGoalSubgoalService.getPlanGoalSubgoalDetail(state.documentDetail.attachment.model.uuid)
                if (planGoalSubgoal) {
                    state.formTemplate.plan_uuid = planGoalSubgoal?.plan?.uuid
                    state.formTemplate.goal_uuid = planGoalSubgoal?.goal?.uuid
                    state.formTemplate.subgoal_uuid = planGoalSubgoal?.subgoal?.uuid
                }
            }
        }

    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchAllForms() {
    state.error = {}
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
}

async function fetchAllPlans() {
    state.error = {}
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
}

async function fetchAllGoalsPerPlan(planUuid: any) {
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
}

async function fetchAllSubgoalsPerGoal(goalUuid: any) {
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
}

async function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        state.modal.isRespondOpen = true
    }
}
</script>

<style>
#formTemplate .multiselect-dropdown {
    max-height: 4.8rem !important;
}
</style>