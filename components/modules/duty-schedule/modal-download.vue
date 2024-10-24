<template>
    <div>
        <Modal size="xs" :title="$t('dutySchedules.download.download')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="space-y-3">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <form @submit.prevent="handleDownload()" id="formShift">
                            <div class="space-y-3">
                                <div class="space-y-1">
                                    <FormLabel for="download_type" :label="$t('dutySchedules.download.downloadType')" />
                                    <FormSelect id="download_type" name="download_type"
                                        :options="state.options.downloadType"
                                        v-model="state.formDownload.download_type" />
                                    <FormError
                                        :error="v$?.formDownload?.download_type?.$errors[0]?.$message.toString()" />
                                </div>
                                <div class="space-y-1">
                                    <FormLabel for="date" :label="$t('dutySchedules.download.date')" />
                                    <FormDateRangeField name="date_range"
                                        :placeholder="$t('citizens.citizenJournals.filter.filterDate')"
                                        @change="setDateRange" />
                                    <FormError :error="v$?.date_range?.$errors[0]?.$message.toString()" />
                                </div>
                            </div>
                            <div class="mt-6">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                                        @click="closeModal">
                                        {{ $t('cancel') }}
                                    </FormButton>
                                    <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full">
                                        {{ $t('dutySchedules.download.download') }}
                                    </FormButton>
                                </div>
                            </div>
                        </form>
                    </div>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { dutyScheduleService } from '@/components/api/DutyScheduleService'
import type { Error } from '@/types'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import { saveAs } from 'file-saver'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const { t } = useI18n()
const emit = defineEmits(['close', 'saveShift'])

const state = reactive({
    date_range: null,
    error: {} as Error,
    isPageLoading: false,
    formDownload: {
        download_type: '',
        start_date: '',
        end_date: '',
    },
    options: {
        downloadType: [
            { value: 'excel', label: 'Download hours in excel' },
            { value: 'overview', label: 'Download duty schedule overview' }
        ]
    }
})

watch(() => props.isModalOpen, () => {
    state.error = {}
    state.formDownload.download_type = ''
    state.options.downloadType[0].label = `${t('dutySchedules.download.downloadHoursInExcel')}`
    state.options.downloadType[1].label = `${t('dutySchedules.download.downloadOverview')}`
})

const rules = computed(() => {
    return {
        date_range: {
            required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
        },
        formDownload: {
            download_type: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
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
    state.formDownload.start_date = startDate
    state.formDownload.end_date = endDate
    state.date_range = dateRange
}

async function handleDownload() {
    v$.value.$validate()
    if (!v$.value.$error) {
        downloadDutySchedule()
    }
}

async function downloadDutySchedule() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            download_type: state.formDownload.download_type,
            start_date: state.formDownload.start_date,
            end_date: state.formDownload.end_date,
        }
        const response = await dutyScheduleService.downloadDutySchedules(params)
        if (response) {
            if (response) {
                saveAs(response, 'Duty-schedule')
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>

<style>
#formShift .multiselect-dropdown {
    max-height: 6rem !important;
}
</style>