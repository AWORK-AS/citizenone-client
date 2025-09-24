<template>
    <div>
        <Modal size="lg" :title="$t('dailyOverview.quickRiskAssessment.quickRiskAssessment')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="flex justify-end">
                        <button class="text-sm text-primary hover:text-primary-700"
                            @click="state.modal.showCurrentPlansAndGoals = !state.modal.showCurrentPlansAndGoals"
                            v-if="state.plans?.data?.length > 0">
                            <span v-if="state.modal.showCurrentPlansAndGoals">
                                {{ $t('citizens.citizenJournals.form.hideCurrentPlansGoalsAndSubgoals') }}
                            </span>
                            <span v-else>
                                {{ $t('citizens.citizenJournals.form.showCurrentPlansGoalsAndSubgoals') }}
                            </span>
                        </button>
                    </div>
                    <ModulesUserDailyOverviewQuickRiskAssessmentForm formType="create"
                        :selectedJournal="state.formJournal" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="saveQuickRiskAssessment" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import moment from 'moment'
import { journalService } from '@/components/api/user/JournalService'
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
const emit = defineEmits(['close'])

const state = reactive({
    dataFilter: [],
    error: {} as Error,
    isPageLoading: false,
    formJournal: {
        id: '',
        uuid: '',
        citizen_uuid: '',
        date: '',
        title: '',
        is_draft: false,
        assessment: null,
        note: '',
    },
    modal: {
        showCurrentPlansAndGoals: false,
    },
    plans: [] as any,
    selectedPlan: [] as any,
    slideOver: {
        isGoalOpen: false
    },
    sortData: {
        sortField: 'completion_date',
        sortOrder: 'descend',
    },
})

function closeModal() {
    emit('close')
}

async function saveQuickRiskAssessment(quickRiskAssessmentDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            citizen_uuid: quickRiskAssessmentDetails.citizen_uuid,
            title: quickRiskAssessmentDetails.title,
            date: quickRiskAssessmentDetails.date,
            note: quickRiskAssessmentDetails.note,
            is_draft: quickRiskAssessmentDetails.is_draft,
        }
        const response = await journalService.saveJournal(params)
        if (response?.data) {
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('dailyOverview.quickRiskAssessment.alert.quickRiskAssessmentSuccessfullyAdded')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>