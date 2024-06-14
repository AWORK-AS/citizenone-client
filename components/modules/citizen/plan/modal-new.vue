<template>
    <div>
        <Modal size="sm" :title="$t('plansandgoals.newPlan')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesCitizenPlanForm formType="create" :selectedPlan="state.formPlan" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="savePlan" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { planService } from '@/components/api/PlanService'
import { useI18n } from "vue-i18n"
import { notify } from "@kyvg/vue3-notification"

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
    error: [],
    isPageLoading: false,
    formPlan: {
        id: '',
        uuid: '',
        name: '',
        completion_date: '',
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
    state.isPageLoading = true
    try {
        const params = {
            citizen_uuid: citizenUuid,
            name: planDetails.name,
            completion_date: planDetails.completion_date,
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

function successAlert(title: string, message: string) {
    notify({
        title: title,
        text: message,
        type: 'success',
    })
}
</script>