<template>
    <div>
        <Modal size="xl" :title="$t('plansandgoals.createStatusTemplate')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">

                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { planService } from '@/components/api/user/PlanService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const emit = defineEmits(['close', 'refreshPlans'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formPlan: {
        id: '',
        uuid: '',
        name: '',
        description: '',
        completion_date: '',
        score: '',
        date_completed: '',
        is_completed: false,
    },
})

function closeModal() {
    emit('close')
}

function refreshPlans() {
    emit('refreshPlans')
}

async function savePlan(planDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        let params = {}
        if (planDetails.is_use_template) {
            params = {
                citizen_uuid: citizenUuid,
                template_uuid: planDetails.template,
                plan_completion_date: planDetails.plan_completion_date,
                goal_completion_date: planDetails.goal_completion_date,
                subgoal_completion_date: planDetails.subgoal_completion_date,
            }
        } else {
            params = {
                citizen_uuid: citizenUuid,
                name: planDetails.name,
                completion_date: planDetails.completion_date,
                score: planDetails.score,
                description: planDetails.description,
            }
        }
        const response = await planService.savePlan(params)
        if (response?.data) {
            refreshPlans()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('plansandgoals.alert.planSuccessfullyAdded')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>