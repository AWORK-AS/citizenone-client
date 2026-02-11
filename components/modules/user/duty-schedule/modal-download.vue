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
                                    <FormLabel for="date" :label="$t('dutySchedules.download.date')" />
                                    <FormDateRangeField id="date" name="date_range"
                                        :placeholder="$t('dutySchedules.download.filterDate')"
                                        v-model="state.filter.date_range" />
                                    <FormError :error="v$?.filter.date_range?.$errors[0]?.$message.toString()" />
                                </div>
                                <div class="space-y-1">
                                    <FormLabel for="download_type" :label="$t('dutySchedules.download.downloadType')" />
                                    <FormSelect id="download_type" name="download_type"
                                        :options="state.options.downloadType"
                                        v-model="state.formDownload.download_type" />
                                    <FormError
                                        :error="v$?.formDownload?.download_type?.$errors[0]?.$message.toString()" />
                                </div>
                                <div class="space-y-1">
                                    <div class="flex justify-between items-center py-0.5">
                                        <p class="text-sm text-gray-600">
                                            {{ customPagesStore.getCustomPagesName?.department ??
                                                $t('dutySchedules.download.department') }}
                                        </p>
                                        <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                                            @click="state.modal.isAddDepartmentOpen = true">
                                            {{ $t('departments.addNewDepartment') }}
                                        </span>
                                    </div>
                                    <FormSelectMultiple id="departments" :options="state.options.departments"
                                        v-model="state.formDownload.departments" />
                                    <FormError
                                        :error="v$?.formDownload?.departments?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.departments_uuid?.[0]" />
                                </div>
                                <div class="space-y-1">
                                    <div class="w-fit flex items-center cursor-pointer"
                                        @click="state.formDownload.show_leaves_only = !state.formDownload.show_leaves_only">
                                        <FormCheckbox :value="state.formDownload.show_leaves_only" />
                                        {{ $t('dutySchedules.download.showLeavesOnly') }}
                                    </div>
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
                <ModulesUserDepartmentModalNew :isModalOpen="state.modal.isAddDepartmentOpen"
                    @close="state.modal.isAddDepartmentOpen = false" @refreshDepartments="fetchDepartments" />
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { departmentService } from '@/components/api/user/DepartmentService'
import { dutyScheduleService } from '@/components/api/user/DutyScheduleService'
import { useCustomPagesStore } from '@/store/custom-pages'
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
const customPagesStore = useCustomPagesStore() as any

const state = reactive({
    error: {} as Error,
    filter: {
        date_range: [] as any,
    },
    isPageLoading: false,
    formDownload: {
        departments: [],
        download_type: '',
        date_start: '',
        date_end: '',
        show_leaves_only: false,
    },
    modal: {
        isAddDepartmentOpen: false,
    },
    options: {
        departments: [],
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
    state.formDownload.show_leaves_only = false
    fetchDepartments()
})

const rules = computed(() => {
    return {
        filter: {
            date_range: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
        formDownload: {
            departments: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
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
        downloadDutySchedule()
    }
}

async function fetchDepartments() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {}
        const response = await departmentService.getAllDepartments(params)
        if (response) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.name,
                })
            )
            state.options.departments = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function downloadDutySchedule() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            department_uuid: Array(state.formDownload.departments),
            download_type: state.formDownload.download_type,
            date_start: state.formDownload.date_start,
            date_end: state.formDownload.date_end,
            show_leaves_only: state.formDownload.show_leaves_only,
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
    max-height: 5rem !important;
}
</style>