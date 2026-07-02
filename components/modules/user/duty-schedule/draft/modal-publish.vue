<template>
    <div>
        <Modal size="xs" :title="$t('dutySchedules.draft.publish')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="flex flex-col items-center space-y-4 py-6" v-if="state.isPublished">
                    <div class="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                        <Icon name="ph:check-bold" class="w-7 h-7 text-green-600" />
                    </div>
                    <div class="text-center space-y-1">
                        <p class="text-base font-semibold text-gray-800">{{ $t('dutySchedules.draft.alert.successfullyPublished') }}</p>
                    </div>
                    <FormButton buttonStyle="primary" class="w-full mt-2" @click="navigateTo('/schedules')">
                        {{ $t('dutySchedules.draft.backToPublished') }}
                    </FormButton>
                </div>
                <LoadingSpinner :isActive="state.isPageLoading" v-else-if="!state.isPublishing">
                    <div class="space-y-3">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <form @submit.prevent="handleDownload()" id="formPublish">
                            <div class="space-y-3">
                                <div class="space-y-1">
                                    <FormLabel for="date" :label="$t('dutySchedules.download.date')" />
                                    <FormDateRangeField id="date" name="date_range"
                                        :placeholder="$t('citizens.citizenJournals.filter.filterDate')"
                                        v-model="state.filter.date_range" />
                                    <FormError :error="v$?.filter.date_range?.$errors[0]?.$message.toString()" />
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
                                        v-model="state.formPublish.departments" />
                                    <FormError :error="v$?.formPublish?.departments?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.departments_uuid?.[0]" />
                                </div>
                            </div>
                            <div class="mt-6">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <FormButton type="button" buttonStyle="cancel" @click="closeModal" :disabled="state.isPublishing">
                                        {{ $t('cancel') }}
                                    </FormButton>
                                    <FormButton type="submit" buttonStyle="primary" class="w-full" :disabled="state.isPublishing">
                                        {{ $t('dutySchedules.draft.publish') }}
                                    </FormButton>
                                </div>
                            </div>
                        </form>
                    </div>
                </LoadingSpinner>
                <div class="flex flex-col items-center space-y-4 py-6" v-else>
                    <svg class="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none"
                        viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                    <p class="text-sm text-gray-600">{{ $t('dutySchedules.draft.publishing') }}</p>
                </div>
                <ModulesUserDepartmentModalNew :isModalOpen="state.modal.isAddDepartmentOpen"
                    @close="state.modal.isAddDepartmentOpen = false" @refreshDepartments="fetchDepartments" />
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { departmentService } from '@/components/api/user/DepartmentService'
import { draftScheduleService } from '@/components/api/user/DraftScheduleService'
import { useCustomPagesStore } from '@/store/custom-pages'
import type { Error } from '@/types'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const { t } = useI18n()
const emit = defineEmits(['close', 'refreshDutySchedules'])
const customPagesStore = useCustomPagesStore() as any

const state = reactive({
    error: {} as Error,
    filter: {
        date_range: [] as any,
    },
    isPageLoading: false,
    isPublished: false,
    isPublishing: false,
    formPublish: {
        departments: [],
        download_type: '',
        date_start: '',
        date_end: '',
    },
    modal: {
        isAddDepartmentOpen: false,
    },
    options: {
        departments: [],
    }
})

watch(() => props.isModalOpen, () => {
    state.error = {}
    state.isPublished = false
    fetchDepartments()
})

const rules = computed(() => {
    return {
        filter: {
            date_range: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
        formPublish: {
            departments: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})
const v$ = useVuelidate(rules, state)

function closeModal() {
    if (state.isPublishing) return
    state.isPublished = false
    emit('close')
}

watch(() => state.filter.date_range, (dates: any) => {
    state.formPublish.date_start = dates?.[0]
    state.formPublish.date_end = dates?.[1]
})

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

async function handleDownload() {
    v$.value.$validate()
    if (!v$.value.$error) {
        publishSchedule()
    }
}

async function publishSchedule() {
    try {
        state.isPublishing = true
        const params = {
            department_uuid: state.formPublish.departments,
            date_start: state.formPublish.date_start,
            date_end: state.formPublish.date_end,
        }
        const response = await draftScheduleService.publishSchedule(params)
        if (response?.queued === false) {
            state.isPublishing = false
            state.isPublished = true
            return
        }
        await waitForPublish()
    } catch (error: any) {
        state.error = error
        state.isPublishing = false
    }
}

function waitForPublish(): Promise<void> {
    return new Promise((resolve) => {
        const poll = async () => {
            try {
                const s = await draftScheduleService.getPublishStatus()
                if (s?.status === 'completed') {
                    state.isPublishing = false
                    state.isPublished = true
                    return resolve()
                }
                if (s?.status === 'failed') {
                    state.error = { message: t('dutySchedules.draft.alert.publishFailed') } as any
                    state.isPublishing = false
                    return resolve()
                }
                setTimeout(poll, 2500)
            } catch {
                setTimeout(poll, 2500)
            }
        }
        poll()
    })
}
</script>

<style>
#formPublish .multiselect-dropdown {
    max-height: 5rem !important;
}
</style>