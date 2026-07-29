<template>
    <div>
        <Modal size="xs" :title="$t('mileageLog.download.downloadMileageLog')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div id="mileageLogDownloadForm">
                        <div class="space-y-3">
                            <Alert type="danger" :text="state?.error?.message"
                                v-if="state.error?.message && state.error.message.length > 0" />
                            <div class="space-y-1">
                                <FormDateRangeField name="date_range" v-model="state.filter.date_range"
                                    :placeholder="$t('mileageLog.download.filterDate')" />
                                <FormError :error="v$?.filter.date_range?.$errors[0]?.$message.toString()" />
                            </div>
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" @click="closeModal">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary" class="w-full"
                                    @click="downloadMileageLog">
                                    {{ $t('mileageLog.download.download') }}
                                </FormButton>
                            </div>
                        </div>
                    </div>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { mileageLogService } from '@/components/api/user/MileageLogService'
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
    employeeUuid: {
        type: String,
        required: false,
    },
    filters: {
        type: Object,
        required: false,
    },
})
const emit = defineEmits(['close'])

const { t } = useI18n()

const state = reactive({
    downloadForm: {
        start_date: '',
        end_date: '',
    },
    error: {} as Error,
    filter: {
        date_range: [],
    },
    isPageLoading: false,
})

const rules = computed(() => {
    return {
        filter: {
            date_range: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        }
    }
})

const v$ = useVuelidate(rules, state)

function closeModal() {
    emit('close')
}

watch(() => state.filter.date_range, (dates: any) => {
    state.downloadForm.start_date = dates?.[0]
    state.downloadForm.end_date = dates?.[1]
})

async function downloadMileageLog() {
    state.error = {}
    state.isPageLoading = true
    v$.value.$validate()
    if (!v$.value.$error) {
        try {
            let params = {
                start_date: state.downloadForm.start_date,
                end_date: state.downloadForm.end_date,
            } as any

            if (props?.filters?.department_uuids?.length > 0) {
                params.department_uuids = Array(props?.filters?.department_uuids)
            }
            if (props?.filters?.employee_uuids?.length > 0) {
                params.user_uuids = Array(props?.filters?.employee_uuids)
            }

            const response = props.employeeUuid
                ? await mileageLogService.downloadEmployeeMileageLogReport(props.employeeUuid, params)
                : await mileageLogService.downloadMileageLogReport(params)

            if (response) {
                saveAs(response, `${t('mileageLog.mileageLog').replace(' ', '-')}` + '-' + moment(state.downloadForm.start_date).format('MMMM-D-YYYY') + '-' + moment(state.downloadForm.end_date).format('MMMM-D-YYYY'))
            }
        } catch (error: any) {
            state.error = error
        }
    }
    state.isPageLoading = false
}
</script>
