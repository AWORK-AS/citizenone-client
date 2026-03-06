<template>
    <div>
        <Modal size="xs" :title="$t('citizens.interventionHours.download.downloadInterventionHours')"
            :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div id="formDownload">
                        <div class="space-y-3">
                            <Alert type="danger" :text="state?.error?.message"
                                v-if="state.error?.message && state.error.message.length > 0" />
                            <div class="space-y-1">
                                <FormDateRangeField name="date_range" v-model="state.filter.date_range"
                                    :placeholder="$t('citizens.interventionHours.download.filter.filterDate')" />
                                <FormError :error="v$?.filter.date_range?.$errors[0]?.$message.toString()" />
                            </div>
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="closeModal">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full"
                                    @click="downloadInterventionHours">
                                    {{ $t('citizens.interventionHours.download.download') }}
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
import { interventionHoursService } from '@/components/api/user/InterventionHoursService'
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
    filters: {
        type: Object,
        required: false,
    },
})
const emit = defineEmits(['close'])

const { t } = useI18n()
const language = useI18n()
const router = useRouter()
const employeeUuid = router?.currentRoute?.value?.params?.employee_uuid

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
    options: {
        tags: [],
    },
})

const rules = computed(() => {
    return {
        filter: {
            date_range: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
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

async function downloadInterventionHours() {
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
            if (props?.filters?.citizen_uuids?.length > 0) {
                params.citizen_uuids = Array(props?.filters?.citizen_uuids)
            }
            if (props?.filters?.user_uuids?.length > 0) {
                params.user_uuids = Array(props?.filters?.user_uuids)
            }
            if (props?.filters?.is_transportation !== '') {
                params.is_transportation = props?.filters?.is_transportation
            }
            const response = await interventionHoursService.downloadInterventionHoursEmployeeReport(employeeUuid, params)
            if (response) {
                saveAs(response, `${t('citizens.interventionHours.interventionHours').replace(' ', '-')}` + '-' + moment(state.downloadForm.start_date).format('MMMM-D-YYYY') + '-' + moment(state.downloadForm.end_date).format('MMMM-D-YYYY'))
            }
        } catch (error: any) {
            state.error = error
        }
    }
    state.isPageLoading = false
}
</script>

<style>
#formDownload .multiselect-dropdown {
    max-height: 4.8rem !important;
}
</style>