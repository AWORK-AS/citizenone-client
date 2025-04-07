<template>
    <div>
        <Modal size="sm" :title="$t('dutySchedules.newSchedule')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="saveShift()" id="formShift" class="space-y-3">
                        <Alert type="danger" :text="props?.error?.message"
                            v-if="props.error?.message && props.error.message.length > 0" />
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="space-y-1">
                            <FormLabel for="shift_type" :label="$t('dutySchedules.typeofShift')" />
                            <FormSelect id="shift_type" name="shift_type" :options="state.options.shifts"
                                v-model="state.formShift.shift_type" />
                            <FormError :error="v$?.formShift?.shift_type?.$errors[0]?.$message.toString()" />
                            <FormError :error="props?.error?.errors?.shift_uuid?.[0]" />
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div class="space-y-1">
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
                        </div>
                        <div v-if="[3, 4].includes(state.options.shifts.findIndex((shift: any) => shift.value ===
                            state.formShift.shift_type))">
                            <div class="w-fit flex items-center cursor-pointer"
                                @click="state.formShift.use_compensatory_time = !state.formShift.use_compensatory_time">
                                <FormCheckbox :value="state.formShift.use_compensatory_time" />
                                {{ $t('dutySchedules.form.useCompensatoryTime') }}
                            </div>
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
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { shiftService } from '@/components/api/user/ShiftService'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedDate: {
        type: String,
        required: true,
    },
})
const { t } = useI18n()
const emit = defineEmits(['close', 'saveShift', 'resetNewShiftError'])
const language = useI18n()
const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formShift: {
        shift_type: '',
        date_time_start: moment().startOf('day').add(8, 'hours').format('YYYY-MM-DD H:mm'),
        date_time_end: moment().startOf('day').add(17, 'hours').format('YYYY-MM-DD H:mm'),
        in_meeting: false,
        use_compensatory_time: false,
    },
    options: {
        shifts: []
    }
})

watch(() => props.isModalOpen, (isModalOpen) => {
    v$.value.$reset()
    emit('resetNewShiftError')
    state.formShift.shift_type = ''
    if (isModalOpen) {
        fetchAllShifts()
    }
    state.formShift.date_time_start = moment(props.selectedDate).startOf('day').add(8, 'hours').format('YYYY-MM-DD H:mm')
    state.formShift.date_time_end = moment(props.selectedDate).startOf('day').add(17, 'hours').format('YYYY-MM-DD H:mm')
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

async function fetchAllShifts() {
    state.error = {}
    state.isPageLoading = true
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
    state.isPageLoading = false
}

async function saveShift() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('saveShift', state.formShift)
    }
}
</script>

<style>
#formShift .multiselect-dropdown {
    max-height: 6rem !important;
}
</style>