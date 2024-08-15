<template>
    <div>
        <Modal size="xs" :title="$t('citizens.citizenJournals.downloadJournals.downloadJournals')"
            :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="space-y-3">
                        <div class="space-y-1">
                            <FormDateRangeField name="date_range"
                                :placeholder="$t('citizens.citizenJournals.filter.filterDate')"
                                @change="setDateRange" />
                            <FormError :error="v$?.date_range?.$errors[0]?.$message.toString()" />
                        </div>
                        <div class="w-fit flex items-center cursor-pointer"
                            @click="state.downloadForm.include_risk_assessment = !state.downloadForm.include_risk_assessment">
                            <FormCheckbox :value="state.downloadForm.include_risk_assessment" />
                            {{ $t('citizens.citizenJournals.downloadJournals.includeRiskAssessment') }}
                        </div>
                    </div>
                    <div class="mt-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="closeModal">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full"
                                @click="downloadJournals">
                                {{ $t('citizens.citizenJournals.download') }}
                            </FormButton>
                        </div>
                    </div>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import moment from 'moment'
import { journalService } from '@/components/api/JournalService'
import { notify } from "@kyvg/vue3-notification"
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import type { Error } from '@/types'
import { saveAs } from 'file-saver'
import { useI18n } from "vue-i18n"

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close'])

const { t } = useI18n()
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid

const state = reactive({
    date_range: null,
    downloadForm: {
        start_date: '',
        end_date: '',
        include_risk_assessment: false,
    },
    error: {} as Error,
    isPageLoading: false
})

const rules = computed(() => {
    return {
        date_range: {
            required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
        },
    }
})

const v$ = useVuelidate(rules, state)

function closeModal() {
    emit('close')
}

async function setDateRange(event: any) {
    const dateRange = event.target.value
    const dates = dateRange.split(" to ")
    const startDate = moment(dates[0], "DD. MMMM YYYY").format("YYYY-MM-DD")
    const endDate = dates[1] ? moment(dates[1], "DD. MMMM YYYY").format("YYYY-MM-DD") : startDate
    state.downloadForm.start_date = startDate
    state.downloadForm.end_date = endDate
    state.date_range = dateRange
}

async function downloadJournals() {
    state.error = {}
    state.isPageLoading = true
    v$.value.$validate()
    console.log('v$.value', v$.value)
    if (!v$.value.$error) {
        try {
            const params = {
                citizen_uuid: citizenUuid,
                start_date: state.downloadForm.start_date,
                end_date: state.downloadForm.end_date,
                include_risk_assessment: state.downloadForm.include_risk_assessment,
            }
            const response = await journalService.downloadJournals(params)
            if (response) {
                saveAs(response, 'Journals' + '-' + moment(state.downloadForm.start_date).format('MMMM-D-YYYY') + '-' + moment(state.downloadForm.end_date).format('MMMM-D-YYYY'))
            }
        } catch (error: any) {
            state.error = error
        }
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