<template>
    <div>
        <Modal size="xl" :title="$t('citizens.documents.createTemplate.createReport')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="submitForm()" id="formTemplate">
                        <div class="space-y-3">
                            <div class="space-y-1">
                                <TemplateSourcePicker v-model="state.formSource"
                                    :communityCount="state.options.communityForms.length" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="form" :label="$t('citizens.documents.createTemplate.form.form')" />
                                <FormSelect id="form" :placeholder="$t('forms.community.searchTemplates')"
                                    :options="state.formSource === 'community' ? state.options.communityForms : state.options.forms"
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
                            <div class="grid md:grid-cols-3 gap-x-3">
                                <div class="space-y-1">
                                    <div class="flex items-center gap-x-1">
                                        <FormLabel for="journal_note_plan"
                                            :label="$t('citizens.documents.createTemplate.form.plan')" />
                                        <span v-if="state.selectedFormHasFollowUp" class="text-red-600">*</span>
                                    </div>
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
                            </div>
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" @click="closeModal()">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary" class="w-full">
                                    {{ $t('proceed') }}
                                </FormButton>
                            </div>
                        </div>
                    </form>
                </LoadingSpinner>
                <ModulesUserCitizenDocumentStatusTemplateModalRespond :isModalOpen="state.modal.isRespondOpen"
                    :selectedFormStatusTemplate="state.formTemplate" @close="state.modal.isRespondOpen = false"
                    @closeModalNew="closeModal()" @refreshDocuments="refreshDocuments()" />
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { citizenDocumentService } from '@/components/api/user/CitizenDocumentService'
import { formService } from '@/components/api/user/FormService'
import TemplateSourcePicker from '@/components/modules/user/document/status-template/source-picker.vue'
import { fetchCommunityTemplateOptions, isCommunityTemplateValue, resolvePickedFormUuid } from '@/composables/useCommunityFormTemplates'
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
    },
    modal: {
        isRespondOpen: false,
    },
    // 'own' lists the company's forms, 'community' the templates shared by other organisations
    formSource: 'own',
    options: {
        forms: [],
        communityForms: [] as any[],
        folders: [],
        plans: [],
        goals: [],
        subgoals: [],
    },
    selectedFormHasFollowUp: false,
})

function closeModal() {
    emit('close')
    resetForm()
}

function refreshDocuments() {
    emit('refreshDocuments')
    resetForm()
}

function resetForm() {
    state.formSource = 'own'
    state.formTemplate = {
        folder_uuid: '',
        form_uuid: '',
        goal_uuid: '',
        plan_uuid: '',
        subgoal_uuid: '',
    }
    state.selectedFormHasFollowUp = false
    v$.value.$reset()
}

watch(() => state.formTemplate.form_uuid, async (formUuid: any) => {
    // A community template has no follow-up until it is imported, and an import never copies one.
    if (formUuid && !isCommunityTemplateValue(formUuid)) {
        try {
            const response = await formService.getForm(formUuid)
            state.selectedFormHasFollowUp = !!response?.data?.is_follow_up_enabled
        } catch {
            state.selectedFormHasFollowUp = false
        }
    } else {
        state.selectedFormHasFollowUp = false
    }
})

watch(() => props.isModalOpen, (isModalOpen: any) => {
    if (isModalOpen) {
        fetchAllFolders()
        fetchAllForms()
        fetchAllPlans()
        fetchAllGoals()
    }
})

const rules = computed(() => {
    return {
        formTemplate: {
            folder_uuid: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            form_uuid: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            plan_uuid: state.selectedFormHasFollowUp && !(state.formTemplate.goal_uuid || state.formTemplate.subgoal_uuid) ? {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            } : {},
        },
    }
})

const v$ = useVuelidate(rules, state)

watch(() => state.formSource, () => {
    state.formTemplate.form_uuid = ''
})

async function fetchAllFolders() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await citizenDocumentService.getAllFolders(citizenUuid)
        if (response) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: folderOptionLabel(item),
                })
            )
            state.options.folders = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
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
            // Templates shared with the CitizenOne community, listed when that source is picked.
            try {
                state.options.communityForms = await fetchCommunityTemplateOptions()
            } catch {
                // The company's own forms stay usable without them.
                state.options.communityForms = []
            }
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
        // A community template is copied into the company first; the report is
        // then filled in on the company's own copy like any other form.
        if (isCommunityTemplateValue(state.formTemplate.form_uuid)) {
            state.isPageLoading = true
            try {
                const importedUuid = await resolvePickedFormUuid(state.formTemplate.form_uuid)
                await fetchAllForms()
                state.formSource = 'own'
                await nextTick()
                state.formTemplate.form_uuid = importedUuid
            } catch (error: any) {
                state.error = error
                state.isPageLoading = false
                return
            }
            state.isPageLoading = false
        }
        state.modal.isRespondOpen = true
    }
}
</script>

<style>
#formTemplate .multiselect-dropdown {
    max-height: 4.8rem !important;
}
</style>