<template>
    <LoadingSpinner :isActive="props.isModalLoading">
        <form @submit.prevent="submitForm()" class="mt-6">
            <Alert type="danger" :text="props?.error?.message"
                v-if="props.error?.message && props.error.message.length > 0" />
            <div class="space-y-3">
                <div class="space-y-1">
                    <FormLabel for="date_time_start" :label="$t('dutySchedules.scheduleSlots.form.dateTimeStart')" />
                    <FormDateTimeField id="date_time_start" name="date_time_start"
                        :placeholder="$t('dutySchedules.scheduleSlots.form.dateTimeStart')"
                        v-model="state.formScheduleSlot.date_time_start" />
                    <FormError :error="v$?.formScheduleSlot?.date_time_start?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.date_time_start?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="date_time_end" :label="$t('dutySchedules.scheduleSlots.form.dateTimeEnd')" />
                    <FormDateTimeField id="date_time_end" name="date_time_end"
                        :placeholder="$t('dutySchedules.scheduleSlots.form.dateTimeEnd')"
                        v-model="state.formScheduleSlot.date_time_end" />
                    <FormError :error="v$?.formScheduleSlot?.date_time_end?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.date_time_end?.[0]" />
                </div>
                <div class="space-y-1">
                    <div class="flex justify-between items-center py-0.5">
                        <FormLabel for="departments"
                            :label="customPagesStore.getCustomPagesName?.department ?? $t('dutySchedules.scheduleSlots.form.department')" />
                        <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                            @click="state.modal.isAddDepartmentOpen = true">
                            {{ $t('departments.addNewDepartment') }}
                        </span>
                    </div>
                    <FormSelectMultiple id="departments" :options="state.options.departments"
                        v-model="state.formScheduleSlot.department_uuid" />
                    <FormError :error="v$?.formScheduleSlot?.department_uuid?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.departments_uuid?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="shift_type" :label="$t('dutySchedules.scheduleSlots.form.shiftType')" />
                    <FormSelect id="shift_type" name="shift_type" :options="state.options.shifts"
                        v-model="state.formScheduleSlot.shift_type" />
                    <FormError :error="v$?.formScheduleSlot?.shift_type?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.shift_uuid?.[0]" />
                </div>
                <div class="space-y-1">
                    <div class="flex justify-between items-center py-0.5">
                        <FormLabel for="job_title_uuid" :label="$t('dutySchedules.scheduleSlots.form.jobTitle')" />
                        <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                            @click="state.modal.isAddJobTitleOpen = true">
                            {{ $t('jobTitles.addNewJobTitle') }}
                        </span>
                    </div>
                    <FormSelectMultiple id="job_title_uuid" name="job_title_uuid" :options="state.options.jobTitles"
                        v-model="state.formScheduleSlot.job_title_uuid" />
                    <FormError :error="v$?.formScheduleSlot?.job_title_uuid?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.job_title_uuid?.[0]" />
                </div>
                <div class="space-y-1">
                    <div class="flex justify-between items-center py-0.5">
                        <FormLabel for="job_specialty_uuid"
                            :label="$t('dutySchedules.scheduleSlots.form.jobSpecialty')" />
                        <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                            @click="addNewJobSpecialty">
                            {{ $t('jobSpecialties.addNewJobSpecialty') }}
                        </span>
                    </div>
                    <FormSelectMultiple id="job_specialty_uuid" name="job_specialty_uuid"
                        :options="state.options.jobSpecialties" v-model="state.formScheduleSlot.job_specialty_uuid" />
                    <FormError :error="v$?.formScheduleSlot?.job_specialty_uuid?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.job_specialty_uuid?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="available_slots" :label="$t('dutySchedules.scheduleSlots.form.numberOfShifts')" />
                    <FormTextField id="available_slots" name="available_slots"
                        :placeholder="$t('dutySchedules.scheduleSlots.form.numberOfShifts')"
                        v-model="state.formScheduleSlot.available_slots" />
                    <FormError :error="v$?.formScheduleSlot?.available_slots?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.available_slots?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="citizen_uuid" :label="$t('dutySchedules.form.citizens')" />
                    <FormSelectMultiple id="citizen_uuid" :options="state.options.citizens"
                        v-model="state.formScheduleSlot.citizen_uuid" />
                    <FormError :error="props?.error?.errors?.citizen_uuid?.[0]" />
                </div>
                <div class="space-y-1">
                    <div class="flex justify-between items-center py-0.5">
                        <FormLabel for="schedule_tag_uuid" :label="$t('dutySchedules.form.tags')" />
                        <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                            @click="state.modal.isAddNewScheduleTagOpen = true">
                            {{ $t('scheduleTags.addNewScheduleTag') }}
                        </span>
                    </div>
                    <FormSelectMultiple id="schedule_tag_uuid" name="schedule_tag_uuid"
                        :options="state.options.scheduleTags" v-model="state.formScheduleSlot.schedule_tag_uuid" />
                    <FormError :error="props?.error?.errors?.schedule_tag_uuid?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="note" :label="`${$t('dutySchedules.form.note')}.`" />
                    <FormTextArea id="note" name="note" :placeholder="$t('dutySchedules.form.note')"
                        v-model="state.formScheduleSlot.note" />
                    <FormError :error="props?.error?.errors?.note?.[0]" />
                </div>
            </div>
            <div class="mt-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormButton type="button" buttonStyle="cancel" @click="closeModal" :disabled="props.isModalLoading">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton type="submit" buttonStyle="primary" :disabled="props.isModalLoading">
                        {{ props.formType === 'create' ? $t('save') :
                            $t('update') }}
                    </FormButton>
                </div>
            </div>
            <ModulesUserDepartmentModalNew :isModalOpen="state.modal.isAddDepartmentOpen"
                @close="state.modal.isAddDepartmentOpen = false" @refreshDepartments="fetchDepartments" />
            <ModulesUserJobTitleModalNew :isModalOpen="state.modal.isAddJobTitleOpen"
                @close="state.modal.isAddJobTitleOpen = false" @refreshJobTitles="fetchJobTitles" />
            <ModulesUserJobSpecialtyModalNew :isModalOpen="state.modal.isAddJobSpecialtyOpen"
                @close="state.modal.isAddJobSpecialtyOpen = false" @refreshJobTitles="fetchJobTitles"
                @refreshJobSpecialty="fetchJobSpecialties($event)" />
            <ModulesUserScheduleTagModalNew :isModalOpen="state.modal.isAddNewScheduleTagOpen"
                @close="state.modal.isAddNewScheduleTagOpen = false" @refreshScheduleTags="fetchAllScheduleTags" />
        </form>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { departmentService } from '@/components/api/user/DepartmentService'
import { jobTitleService } from '@/components/api/user/JobTitleService'
import { jobSpecialtyService } from '@/components/api/user/JobSpecialtyService'
import { shiftService } from '@/components/api/user/ShiftService'
import { scheduleTagService } from '@/components/api/user/ScheduleTagService'
import { citizenService } from '@/components/api/user/CitizenService'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useDepartmentStore } from '@/store/department'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedDay: {
        type: Object,
        required: false,
    },
    selectedScheduleSlot: {
        type: Object,
        required: true,
    },
    isModalLoading: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['isPageLoading', 'submitForm', 'closeModal'])
const { errorAlert } = useAlert()
const { t } = useI18n()
const language = useI18n()
const customPagesStore = useCustomPagesStore() as any
const departmentStore = useDepartmentStore()

const state = reactive({
    error: {} as Error,
    formScheduleSlot: {
        date_time_start: props.selectedScheduleSlot?.date_time_start,
        date_time_end: props.selectedScheduleSlot?.date_time_end,
        department_uuid: [],
        job_title_uuid: props.selectedScheduleSlot?.job?.uuid || [],
        job_specialty_uuid: [],
        available_slots: props.selectedScheduleSlot?.available_slots.toString(),
        shift_type: props.selectedScheduleSlot?.shift?.uuid,
        citizen_uuid: [] as string[],
        schedule_tag_uuid: [] as string[],
        note: props.selectedScheduleSlot?.note ?? '',
    } as any,
    modal: {
        isAddDepartmentOpen: false,
        isAddJobSpecialtyOpen: false,
        isAddJobTitleOpen: false,
        isAddNewScheduleTagOpen: false,
    },
    options: {
        departments: [],
        jobSpecialties: [],
        jobTitles: [],
        shifts: [],
        citizens: [],
        scheduleTags: [],
    }
})

onMounted(() => {
    fetchDepartments()
    fetchAllShifts()
    fetchJobTitles()
    fetchAllCitizens()
    fetchAllScheduleTags()
    if (props.selectedScheduleSlot?.job_titles) {
        props.selectedScheduleSlot.job_titles.forEach((jobTitle: any) => {
            state.formScheduleSlot.job_title_uuid.push(jobTitle?.uuid)
        })
        fetchJobSpecialties(state.formScheduleSlot.job_title_uuid)
    }
    if (props.selectedScheduleSlot?.departments) {
        props.selectedScheduleSlot.departments.forEach((department: any) => {
            state.formScheduleSlot.department_uuid.push(department?.uuid)
        })
    }
    if (props.selectedScheduleSlot?.schedule_specialties) {
        props.selectedScheduleSlot.schedule_specialties.forEach((scheduleSpeciality: any) => {
            state.formScheduleSlot.job_specialty_uuid.push(scheduleSpeciality?.job_specialty?.uuid)
        })
    }
    if (props.selectedScheduleSlot?.citizens) {
        props.selectedScheduleSlot.citizens.forEach((c: any) => {
            state.formScheduleSlot.citizen_uuid.push(c.uuid)
        })
    }
    if (props.selectedScheduleSlot?.tags) {
        props.selectedScheduleSlot.tags.forEach((tag: any) => {
            state.formScheduleSlot.schedule_tag_uuid.push(tag.uuid)
        })
    }
})

function closeModal() {
    if (props.isModalLoading) return
    emit('closeModal')
}

async function fetchDepartments() {
    state.error = {}
    emit('isPageLoading', true)
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
    emit('isPageLoading', false)
}

async function fetchAllShifts() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const params = {}
        const response = await shiftService.getAllShifts(params)
        if (response?.data) {
            let options: any = []
            response.data.forEach(
                (shift: any) => options.push({
                    value: shift?.uuid,
                    label: language.locale.value === 'en' ? shift?.en_name :
                        language.locale.value === 'no' ? shift?.no_name :
                            language.locale.value === 'sv' ? shift?.sv_name :
                                shift?.dk_name,
                })
            )
            state.options.shifts = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

async function fetchJobTitles() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const response = await jobTitleService.getAllJobTitles()
        if (response) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.title,
                })
            )
            state.options.jobTitles = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

watch(() => state.formScheduleSlot.job_title_uuid, () => {
    fetchJobSpecialties(state.formScheduleSlot.job_title_uuid)
})

async function fetchJobSpecialties(jobTitleUuid: any) {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const params = {
            job_title_uuids: Array(jobTitleUuid)
        }
        const response = await jobSpecialtyService.getAllJobSpecialties(params)
        if (response) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.title,
                })
            )
            state.options.jobSpecialties = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

function addNewJobSpecialty() {
    if (state.formScheduleSlot.job_title_uuid) {
        state.modal.isAddJobSpecialtyOpen = true
    } else {
        errorAlert(`${t('alert.required')}!`, `${t('alert.jobTitleRequired')}.`)
    }
}

async function fetchAllCitizens() {
    emit('isPageLoading', true)
    try {
        const response = await citizenService.getAllCitizens({})
        if (response.data) {
            state.options.citizens = response.data.map((c: any) => ({
                value: c.uuid,
                label: c.firstname + ' ' + (c.lastname ?? ''),
            }))
        }
    } catch (error: any) { state.error = error }
    emit('isPageLoading', false)
}

async function fetchAllScheduleTags() {
    emit('isPageLoading', true)
    try {
        const response = await scheduleTagService.getAllScheduleTags({
            department: departmentStore.getSelectedDepartmentName,
        })
        if (response.data) {
            state.options.scheduleTags = response.data.map((tag: any) => ({
                value: tag.uuid,
                label: tag.tag,
            }))
        }
    } catch (error: any) { state.error = error }
    emit('isPageLoading', false)
}

const rules = computed(() => {
    return {
        formScheduleSlot: {
            date_time_start: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            date_time_end: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            available_slots: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            shift_type: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formScheduleSlot)
    }
}
</script>