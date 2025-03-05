<template>
    <form @submit.prevent="submitForm()" class="mt-6">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="space-y-1" v-if="formType === 'update'">
                <FormLabel for="date" :label="$t('dutySchedules.scheduleSlots.form.date')" />
                <FormDateField id="date" name="date" :placeholder="$t('dutySchedules.scheduleSlots.form.date')"
                    v-model="state.formScheduleSlot.date" />
                <FormError :error="v$?.formScheduleSlot?.date?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.date?.[0]" />
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
                <FormSelect id="job_title_uuid" name="job_title_uuid" :options="state.options.jobTitles"
                    v-model="state.formScheduleSlot.job_title_uuid" @change="changeJobTitle" />
                <FormError :error="v$?.formScheduleSlot?.job_title_uuid?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.job_title_uuid?.[0]" />
            </div>
            <div class="space-y-1">
                <div class="flex justify-between items-center py-0.5">
                    <FormLabel for="job_specialty_uuid" :label="$t('dutySchedules.scheduleSlots.form.jobSpecialty')" />
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
                <FormLabel for="time_in" :label="$t('dutySchedules.scheduleSlots.form.timeIn')" />
                <FormTimeField id="time_in" name="time_in" :placeholder="$t('dutySchedules.scheduleSlots.form.timeIn')"
                    v-model="state.formScheduleSlot.time_in"
                    class="border border-primary placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-700 focus:border-primary-700 focus:z-10 sm:text-sm" />
                <FormError :error="v$?.formScheduleSlot?.time_in?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.time_in?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="time_out" :label="$t('dutySchedules.scheduleSlots.form.timeOut')" />
                <FormTimeField id="time_out" name="time_out"
                    :placeholder="$t('dutySchedules.scheduleSlots.form.timeOut')"
                    v-model="state.formScheduleSlot.time_out"
                    class="border border-primary placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-700 focus:border-primary-700 focus:z-10 sm:text-sm" />
                <FormError :error="v$?.formScheduleSlot?.time_out?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.time_out?.[0]" />
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="closeModal">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary" class="rounded-md">
                    {{ props.formType === 'create' ? $t('save') :
                        $t('update') }}
                </FormButton>
            </div>
        </div>
        <ModulesUserJobTitleModalNew :isModalOpen="state.modal.isAddJobTitleOpen"
            @close="state.modal.isAddJobTitleOpen = false" @refreshJobTitle="fetchJobTitles" />
        <ModulesUserJobSpecialtyModalNew :isModalOpen="state.modal.isAddJobSpecialtyOpen"
            :selectedJobTitleUuid="state.formScheduleSlot.job_title_uuid"
            @close="state.modal.isAddJobSpecialtyOpen = false"
            @refreshJobSpecialty="fetchJobSpecialties(state.formScheduleSlot.job_title_uuid)" />
    </form>
</template>

<script setup lang="ts">
import { jobTitleService } from '@/components/api/user/JobTitleService'
import { jobSpecialtyService } from '@/components/api/user/JobSpecialtyService'
import { shiftService } from '@/components/api/user/ShiftService'
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
    }
})
const emit = defineEmits(['isPageLoading', 'submitForm', 'closeModal'])
const { errorAlert } = useAlert()
const { t } = useI18n()
const language = useI18n()

const state = reactive({
    error: {} as Error,
    formScheduleSlot: {
        date: props.selectedScheduleSlot?.date,
        job_title_uuid: props.selectedScheduleSlot?.job?.uuid,
        job_specialty_uuid: [],
        available_slots: props.selectedScheduleSlot?.available_slots.toString(),
        time_in: props.selectedScheduleSlot?.time_in,
        time_out: props.selectedScheduleSlot?.time_out,
        shift_type: props.selectedScheduleSlot?.shift?.uuid,
    } as any,
    modal: {
        isAddJobSpecialtyOpen: false,
        isAddJobTitleOpen: false,
    },
    options: {
        jobSpecialties: [],
        jobTitles: [],
        shifts: []
    }
})

onMounted(() => {
    fetchAllShifts()
    fetchJobTitles()
    if (props.selectedScheduleSlot?.job?.uuid) {
        fetchJobSpecialties(props.selectedScheduleSlot?.job?.uuid)
    }
    if (props.selectedScheduleSlot?.schedule_specialties) {
        props.selectedScheduleSlot.schedule_specialties.forEach((job_specialty: any) => {
            state.formScheduleSlot.job_specialty_uuid.push(job_specialty?.uuid)
        })
    }
})

function closeModal() {
    emit('closeModal')
}

async function fetchAllShifts() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const response = await shiftService.getAllShifts()
        if (response?.data) {
            let options: any = []
            response.data.forEach(
                (shift: any) => options.push({
                    value: shift?.uuid,
                    label: language.locale.value === 'en' ? shift?.en_name : shift?.dk_name,
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

function changeJobTitle(jobTitleUuid: any) {
    state.formScheduleSlot.job_specialty_uuid = []
    fetchJobSpecialties(jobTitleUuid)
}

async function fetchJobSpecialties(jobTitleUuid: any) {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const params = {
            job_title_uuid: jobTitleUuid
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

const rules = computed(() => {
    if (props.formType === 'create') {
        return {
            formScheduleSlot: {
                job_title_uuid: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                available_slots: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                time_in: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                time_out: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                shift_type: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
            },
        }
    } else {
        return {
            formScheduleSlot: {
                date: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                job_title_uuid: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                available_slots: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                time_in: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                time_out: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                shift_type: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
            },
        }
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