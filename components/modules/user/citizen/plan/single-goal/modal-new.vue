<template>
    <div>
        <Modal size="sm" :title="$t('plansandgoals.newSingleGoal')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenPlanSingleGoalForm formType="create" :selectedGoal="state.formGoal"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveGoal" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { goalService } from '@/components/api/user/GoalService'
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
    formGoal: {
        id: '',
        uuid: '',
        name: '',
        description: '',
        enable_reminder: false,
        completion_date: '',
        date_completed: '',
        score: '',
    },
})

function closeModal() {
    emit('close')
}

function refreshPlans() {
    emit('refreshPlans')
}

async function saveGoal(goalDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            citizen_uuid: citizenUuid,
            name: goalDetails.name,
            description: goalDetails.description,
            enable_reminder: goalDetails.enable_reminder,
            completion_date: goalDetails.completion_date,
            score: goalDetails.score,
        }
        const response = await goalService.saveGoal(params)
        if (response?.data) {
            refreshPlans()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('plansandgoals.alert.goalSuccessfullyAdded')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>