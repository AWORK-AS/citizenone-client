<template>
    <div>
        <Modal size="md" :title="$t('plansandgoals.editPlan')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesCitizenPlanForm formType="update" :selectedPlan="props.selectedPlan" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="updatePlan" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { planService } from '@/components/api/PlanService'
import { useI18n } from "vue-i18n"
import { notify } from "@kyvg/vue3-notification"
import type { Error } from '@/types'

const { t } = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedPlan: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshPlans'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false
})

function closeModal() {
    emit('close')
}

function refreshPlans() {
    emit('refreshPlans')
}

async function updatePlan(planDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const planUuid = planDetails.uuid
        const params = {
            name: planDetails.name,
            completion_date: planDetails.completion_date,
            date_completed: planDetails.date_completed,
            is_completed: planDetails.is_completed,
        }
        const response = await planService.updatePlan(planUuid, params)
        if (response?.data) {
            refreshPlans()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('plansandgoals.alert.planSuccessfullyUpdated')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function successAlert(title: string, message: string) {
    notify({
        title: title,
        text: message,
        type: 'success',
    })
}
</script>