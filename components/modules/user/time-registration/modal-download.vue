<template>
    <div>
        <Modal size="xs" :title="$t('timeLogs.download.download')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="space-y-3">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <form @submit.prevent="handleDownload()" id="formShift">
                            <div class="space-y-3">
                                <div class="space-y-1">
                                    <FormLabel for="date" :label="$t('timeLogs.download.date')" />
                                    <FormDateRangeField id="date" name="date_range"
                                        :placeholder="$t('timeLogs.download.filter.filterDate')"
                                        v-model="state.filter.date_range" />
                                    <FormError :error="v$?.filter.date_range?.$errors[0]?.$message.toString()" />
                                </div>
                                <div class="space-y-1">
                                    <FormLabel for="download_type"
                                        :label="$t('timeLogs.download.downloadType.downloadType')" />
                                    <FormSelect id="download_type" name="download_type"
                                        :options="state.options.downloadType"
                                        v-model="state.formDownload.download_type" />
                                    <FormError
                                        :error="v$?.formDownload?.download_type?.$errors[0]?.$message.toString()" />
                                </div>
                                <div class="space-y-1">
                                    <FormLabel for="status" :label="$t('timeLogs.download.status')" />
                                    <FormSelectMultiple id="status" :options="state.options.statuses"
                                        v-model="state.formDownload.status" />
                                    <FormError :error="v$?.formDownload?.status?.$errors[0]?.$message.toString()" />
                                </div>
                            </div>
                            <div class="mt-6">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <FormButton type="button" buttonStyle="cancel" @click="closeModal">
                                        {{ $t('cancel') }}
                                    </FormButton>
                                    <FormButton type="submit" buttonStyle="primary" class="w-full">
                                        {{ $t('timeLogs.download.download') }}
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
import { timeLogService } from '@/components/api/user/TimeLogService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import { saveAs } from 'file-saver'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const { t } = useI18n()
const emit = defineEmits(['close'])
const router = useRouter()
const employeeUuid = router?.currentRoute?.value?.params?.employee_uuid

const state = reactive({
    error: {} as Error,
    filter: {
        date_range: [] as any,
    },
    isPageLoading: false,
    formDownload: {
        date_start: moment().startOf('isoWeek').format('YYYY-MM-DD'),
        date_end: moment().endOf('isoWeek').format('YYYY-MM-DD'),
        download_type: '',
        status: [],
        employee_uuids: [employeeUuid],
    } as any,
    options: {
        downloadType: [
            { value: 'excel', label: `${t('timeLogs.download.downloadType.downloadExcel')}` },
            { value: 'pdf', label: `${t('timeLogs.download.downloadType.downloadPDF')}` },
        ],
        statuses: [
            { value: 'cancelled_by_citizen', label: `${t('timeLogs.filter.onlyCancellationsByCitizen')}` },
            { value: 'cancelled_by_employee', label: `${t('timeLogs.filter.onlyCancellationByEmployee')}` },
            { value: 'completed', label: `${t('timeLogs.filter.heldSessionsOnly')}` },
        ],
    }
})

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) {
        state.options.downloadType[0].label = `${t('timeLogs.download.downloadType.downloadExcel')}`
        state.options.downloadType[1].label = `${t('timeLogs.download.downloadType.downloadPDF')}`
        state.options.statuses[0].label = `${t('timeLogs.filter.onlyCancellationsByCitizen')}`
        state.options.statuses[1].label = `${t('timeLogs.filter.onlyCancellationByEmployee')}`
        state.options.statuses[2].label = `${t('timeLogs.filter.heldSessionsOnly')}`
    }
})

const rules = computed(() => {
    return {
        filter: {
            date_range: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
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

watch(() => state.filter.date_range, (dates: any) => {
    state.formDownload.date_start = dates?.[0]
    state.formDownload.date_end = dates?.[1]
})

async function handleDownload() {
    v$.value.$validate()
    if (!v$.value.$error) {
        downloadTimeLogs()
    }
}

async function downloadTimeLogs() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            download_type: state.formDownload.download_type,
            date_start: state.formDownload.date_start,
            date_end: state.formDownload.date_end,
        } as any
        if (state.formDownload.employee_uuids?.length > 0) {
            params.employee_uuids = Array(state.formDownload.employee_uuids)
        }
        if (state.formDownload.status?.length > 0) {
            params.status = Array(state.formDownload.status)
        }
        const response = await timeLogService.downloadTimeLog(params)
        if (response) {
            if (response) {
                saveAs(response, `${t('timeLogs.timeLogs')?.replaceAll(' ', '-')}`)
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
    max-height: 5rem !important;
}
</style>