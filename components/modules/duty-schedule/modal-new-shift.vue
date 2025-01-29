<template>
    <div>
        <Modal size="xs" :title="$t('dutySchedules.newSchedule')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="saveShift()" id="formShift" class="space-y-3">
                        <div class="space-y-1">
                            <FormLabel for="shift_type" :label="$t('dutySchedules.typeofShift')" />
                            <FormSelect id="shift_type" name="shift_type" :options="state.options.shifts"
                                v-model="state.formShift.shift_type" />
                            <FormError :error="v$?.formShift?.shift_type?.$errors[0]?.$message.toString()" />
                        </div>
                        <div class="space-y-1">
                            {{ state.formShift.date_time_start }}
                            <FormLabel for="date_time_start" :label="$t('dutySchedules.form.datetimeStart')" />
                            <FormDateTimeField id="date_time_start" name="date_time_start"
                                :placeholder="`${$t('dutySchedules.form.datetimeStart')}`"
                                v-model="state.formShift.date_time_start" />
                            <FormError :error="v$?.formShift.date_time_start?.$errors[0]?.$message.toString()" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="date_time_end" :label="$t('dutySchedules.form.dateTimeEnd')" />
                            <FormDateTimeField id="date_time_end" name="date_time_end"
                                :placeholder="`${$t('dutySchedules.form.dateTimeEnd')}`"
                                v-model="state.formShift.date_time_end" />
                            <FormError :error="v$?.formShift.date_time_end?.$errors[0]?.$message.toString()" />
                        </div>
                        <div>
                            <div class="w-fit flex items-center cursor-pointer"
                                @click="state.formShift.in_meeting = !state.formShift.in_meeting">
                                <FormCheckbox :value="state.formShift.in_meeting" />
                                {{ $t('dutySchedules.form.inMeeting') }}
                            </div>
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="closeModal">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full">
                                    {{ $t('create') }}
                                </FormButton>
                            </div>
                        </div>
                    </form>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
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
const emit = defineEmits(['close', 'saveShift'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formShift: {
        shift_type: '',
        date_time_start: moment().startOf('day').format('YYYY-MM-DD H:mm'),
        date_time_end: moment().endOf('day').format('YYYY-MM-DD H:mm'),
        in_meeting: false,
    },
    options: {
        shifts: [
            { value: 'regular_shift', label: 'Regular shift' },
            { value: 'awake_night_shift', label: 'Awake night shift' },
            { value: 'sleeping_night_shift', label: 'Sleeping night shift' },
            { value: 'vacation_leave', label: 'Vacation leave' },
            { value: 'sick_leave', label: 'Sick leave' },
        ]
    }
})

watch(() => props.isModalOpen, () => {
    state.error = {}
    state.formShift.shift_type = ''
    state.options.shifts[0].label = `${t('dutySchedules.shifts.regularShift')}`
    state.options.shifts[1].label = `${t('dutySchedules.shifts.awakeNightShift')}`
    state.options.shifts[2].label = `${t('dutySchedules.shifts.sleepingNightShift')}`
    state.options.shifts[3].label = `${t('dutySchedules.shifts.vacationLeave')}`
    state.options.shifts[4].label = `${t('dutySchedules.shifts.sickLeave')}`
})

const rules = computed(() => {
    return {
        formShift: {
            shift_type: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            date_time_start: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            date_time_end: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})
const v$ = useVuelidate(rules, state)

function closeModal() {
    emit('close')
}

async function saveShift() {
    v$.value.$validate()
    if (!v$.value.$error) {
        closeModal()
        emit('saveShift', state.formShift)
        state.formShift = {
            shift_type: '',
            date_time_start: moment().startOf('day').format('YYYY-MM-DD H:mm'),
            date_time_end: moment().endOf('day').format('YYYY-MM-DD H:mm'),
            in_meeting: false,
        }
        v$.value.$reset()
    }
}
</script>

<style>
#formShift .multiselect-dropdown {
    max-height: 6rem !important;
}
</style>