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
                            <!-- PDF to read, Excel to work with the rows (AW-2026-10154). -->
                            <div class="space-y-1">
                                <FormLabel :label="$t('citizens.interventionHours.download.fileFormat')" />
                                <div class="flex items-center gap-2" role="group"
                                    :aria-label="$t('citizens.interventionHours.download.fileFormat')">
                                    <button v-for="format in downloadFormats" :key="format.value" type="button"
                                        class="px-3 py-1 rounded-lg text-xs font-semibold border transition-colors"
                                        :class="state.downloadType === format.value
                                            ? 'bg-primary text-white border-primary'
                                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'"
                                        :aria-pressed="state.downloadType === format.value"
                                        @click="state.downloadType = format.value">
                                        {{ format.label }}
                                    </button>
                                </div>
                            </div>
                            <label class="flex items-center gap-x-2 text-sm text-gray-700 cursor-pointer">
                                <input type="checkbox" v-model="state.onlyUnprocessed"
                                    class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                {{ $t('timeLogs.exportHistory.onlyUnprocessedOption') }}
                            </label>
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" @click="closeModal">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary" class="w-full"
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
    // Leave out rows in a download already ticked "Behandlet".
    onlyUnprocessed: false,
    // 'pdf' or 'xlsx' (Excel).
    downloadType: 'pdf' as 'pdf' | 'xlsx',
    options: {
        tags: [],
    },
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

const downloadFormats = computed(() => [
    { value: 'pdf' as const, label: t('citizens.interventionHours.download.formatPdf') },
    { value: 'xlsx' as const, label: t('citizens.interventionHours.download.formatExcel') },
])

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
            if (props?.filters?.hour_type_uuids?.length > 0) {
                params['hour_type_uuids[]'] = [...props.filters.hour_type_uuids]
            }
            if (props?.filters?.created_from && props?.filters?.created_to) {
                params.created_from = props.filters.created_from
                params.created_to = props.filters.created_to
            }

            if (state.onlyUnprocessed) {
                params.only_unprocessed = 1
            }
            params.download_type = state.downloadType

            const response = await interventionHoursService.downloadInterventionHoursReport(params)
            if (response) {
                const extension = state.downloadType === 'xlsx' ? 'xlsx' : 'pdf'
                saveAs(response, `${t('citizens.interventionHours.interventionHours').replace(' ', '-')}` + '-' + moment(state.downloadForm.start_date).format('MMMM-D-YYYY') + '-' + moment(state.downloadForm.end_date).format('MMMM-D-YYYY') + '.' + extension)
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