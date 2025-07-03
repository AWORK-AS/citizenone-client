<template>
    <div>
        <Modal size="xl" :title="$t('citizens.documents.createTemplate.createReport')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="submitForm()" id="formStatusTemplate">
                        <div class="space-y-3">
                            <div class="space-y-1">
                                <FormLabel for="form" :label="$t('citizens.documents.createTemplate.form.form')" />
                                <FormSelect id="form" :options="state.options.forms"
                                    v-model="state.formStatusTemplate.form_uuid" />
                                <FormError
                                    :error="v$?.formStatusTemplate?.form_uuid?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.form_uuid?.[0]" />
                            </div>
                            <div class="grid md:grid-cols-3 gap-x-3">
                                <div class="space-y-1">
                                    <FormLabel for="journal_note_plan"
                                        :label="$t('citizens.documents.createTemplate.form.plan')" />
                                    <FormSelect id="journal_note_plan" :options="state.options.plans"
                                        v-model="state.formStatusTemplate.plan_uuid"
                                        @change="(planUuid: any) => fetchAllGoalsPerPlan(planUuid)" />
                                    <FormError
                                        :error="v$?.formStatusTemplate?.plan_uuid?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.plan_uuid?.[0]" />
                                </div>
                                <div class="space-y-1">
                                    <FormLabel for="journal_note_goal"
                                        :label="$t('citizens.documents.createTemplate.form.goal')" />
                                    <FormSelect id="journal_note_goal" :options="state.options.goals"
                                        v-model="state.formStatusTemplate.goal_uuid"
                                        @change="(goalUuid: any) => fetchAllSubgoalsPerGoal(goalUuid)" />
                                    <FormError
                                        :error="v$?.formStatusTemplate?.goal_uuid?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.goal_uuid?.[0]" />
                                </div>
                                <div class="space-y-1">
                                    <FormLabel for="journal_note_subgoals"
                                        :label="$t('citizens.documents.createTemplate.form.subgoal')" />
                                    <FormSelect id="journal_note_subgoals" :options="state.options.subgoals"
                                        v-model="state.formStatusTemplate.subgoal_uuid" />
                                    <FormError
                                        :error="v$?.formStatusTemplate?.subgoal_uuid?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.subgoal_uuid?.[0]" />
                                </div>
                            </div>
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
                <ModulesUserCitizenPlanStatusTemplateModalRespond :isModalOpen="state.modal.isRespondOpen"
                    :selectFormStatusTemplate="state.formStatusTemplate" @close="state.modal.isRespondOpen = false"
                    @closeModalNew="closeModal()" />
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { formService } from '@/components/api/user/FormService'
import { planService } from '@/components/api/user/PlanService'
import { goalService } from '@/components/api/user/GoalService'
import { subgoalService } from '@/components/api/user/SubgoalService'
import { useI18n } from "vue-i18n"
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import type { Error } from '@/types'

const { t } = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const emit = defineEmits(['close'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formStatusTemplate: {
        form_uuid: '',
        goal_uuid: '',
        plan_uuid: '',
        subgoal_uuid: '',
    },
    modal: {
        isRespondOpen: false,
    },
    options: {
        forms: [],
        plans: [],
        goals: [],
        subgoals: [],
    }
})

function closeModal() {
    emit('close')
    resetForm()
}

function resetForm() {
    state.formStatusTemplate = {
        form_uuid: '',
        goal_uuid: '',
        plan_uuid: '',
        subgoal_uuid: '',
    }
    v$.value.$reset()
}

watch(() => props.isModalOpen, (isModalOpen: any) => {
    if (isModalOpen) {
        fetchAllForms()
        fetchAllPlans()
    }
})

const rules = computed(() => {
    return {
        formStatusTemplate: {
            form_uuid: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            plan_uuid: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

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

async function fetchAllGoalsPerPlan(planUuid: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await goalService.getAllGoals(planUuid)
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
#formStatusTemplate .multiselect-dropdown {
    max-height: 4.8rem !important;
}
</style>