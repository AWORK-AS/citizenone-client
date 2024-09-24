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
                <FormError :error="props?.error?.errors?.shift_type?.[0]" />
            </div>
            <div class="space-y-1">
                <div class="flex justify-between items-center py-0.5">
                    <FormLabel for="job_id" :label="$t('dutySchedules.scheduleSlots.form.jobTitle')" />
                    <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                        @click="state.modal.isAddJobTitleOpen = true">
                        {{ $t('jobTitles.addNewJobTitle') }}
                    </span>
                </div>
                <FormSelect id="job_id" name="job_id" :options="state.options.jobTitles"
                    v-model="state.formScheduleSlot.job_id" />
                <FormError :error="v$?.formScheduleSlot?.job_id?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.job_id?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="available_slots" :label="$t('dutySchedules.scheduleSlots.form.availableSlots')" />
                <FormTextField id="available_slots" name="available_slots"
                    :placeholder="$t('dutySchedules.scheduleSlots.form.availableSlots')"
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
        <ModulesJobTitleModalNew :isModalOpen="state.modal.isAddJobTitleOpen"
            @close="state.modal.isAddJobTitleOpen = false" @refreshJobTitle="fetchJobTitles" />
    </form>
</template>

<script setup lang="ts">
import { jobTitleService } from '@/components/api/JobTitleService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
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
})
const emit = defineEmits(['isPageLoading', 'submitForm', 'closeModal'])

const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formScheduleSlot: {
        date: props.selectedScheduleSlot?.date,
        job_id: props.selectedScheduleSlot?.job_id,
        available_slots: props.selectedScheduleSlot?.available_slots.toString(),
        time_in: props.selectedScheduleSlot?.time_in,
        time_out: props.selectedScheduleSlot?.time_out,
        shift_type: props.selectedScheduleSlot?.shift_type,
    },
    modal: {
        isAddJobTitleOpen: false
    },
    options: {
        jobTitles: [],
        shifts: [
            { value: 'regular_shift', label: `${t('dutySchedules.shifts.regularShift')}` },
            { value: 'awake_night_shift', label: `${t('dutySchedules.shifts.awakeNightShift')}` },
            { value: 'sleeping_night_shift', label: `${t('dutySchedules.shifts.sleepingNightShift')}` },
            { value: 'vacation_leave', label: `${t('dutySchedules.shifts.vacationLeave')}` },
            { value: 'sick_leave', label: `${t('dutySchedules.shifts.sickLeave')}` },
        ]
    }
})

onMounted(() => {
    fetchJobTitles()
})

function closeModal() {
    emit('closeModal')
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
                    value: item.id,
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

const rules = computed(() => {
    if (props.formType === 'create') {
        return {
            formScheduleSlot: {
                job_id: {
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
                job_id: {
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