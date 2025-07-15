<template>
    <div>
        <Modal size="sm" :title="$t('citizens.treatments.newTreatment')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenTreatmentForm formType="create" :selectedTreatment="state.formTreatment"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveTreatment" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { treatmentService } from '@/components/api/user/TreatmentService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid as any

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedTreatment: {
        type: Object,
        required: true,
    }
})
const emit = defineEmits(['close', 'refreshTreatments'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formTreatment: {
        id: '',
        uuid: '',
        area_type: '',
        title: '',
        description: '',
        score: '',
        completion_date: '',
        date_completed: '',
        enable_reminder: false,
    },
})

function closeModal() {
    emit('close')
}

function refreshTreatments() {
    emit('refreshTreatments')
}

async function saveTreatment(goalDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            citizen_uuid: citizenUuid,
            area_type: goalDetails.area_type,
            name: goalDetails.name,
            description: goalDetails.description,
            score: goalDetails.score,
            completion_date: goalDetails.completion_date,
            enable_reminder: goalDetails.enable_reminder,
        }
        const response = await treatmentService.saveTreatment(params)
        if (response?.data) {
            refreshTreatments()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.treatments.alert.treatmentSuccessfullyAdded')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>