<template>
    <form @submit.prevent="saveShift()" id="formShift" class="space-y-3">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <div v-if="props?.selectedEmployee?.with_minor && state.showChildProtectionCertificateWarning">
            <div class="bg-red-100 text-black flex items-center px-4 py-3 mb-4 rounded-lg" role="alert">
                <svg class="flex-shrink-0 w-5 h-5 text-red-700 dark:text-red-800" fill="currentColor"
                    viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clip-rule="evenodd"></path>
                </svg>
                <div class="ml-3 text-sm font-medium">
                    <p v-if="language.locale.value === 'en'">
                        <span class="text-red-700">
                            Underaged citizen found and employee has no child protection certificate.
                        </span>
                        <span class="cursor-pointer text-primary hover:text-primary-700"
                            @click="state.showChildProtectionCertificateWarning = false">
                            Upload later.
                        </span>
                    </p>
                    <p v-if="language.locale.value === 'dk'">
                        <span class="text-red-700">
                            Underage borger fundet, og medarbejderen har ikke
                            børnebeskyttelsescertifikat.
                        </span>
                        <span class="cursor-pointer text-primary hover:text-primary-700"
                            @click="state.showChildProtectionCertificateWarning = false">
                            Upload senere.
                        </span>
                    </p>
                </div>
            </div>
        </div>
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
                    :placeholder="`${$t('dutySchedules.form.dateTimeEnd')}`" v-model="state.formShift.date_time_end" />
                <FormError :error="v$?.formShift.date_time_end?.$errors[0]?.$message.toString()" />
            </div>
        </div>
        <div class="space-y-1"
            v-if="!([3, 4].includes(state.options.shifts.findIndex((shift: any) => shift.value === state.formShift.shift_type)))">
            <FormLabel for="citizens" :label="$t('dutySchedules.form.citizens')" />
            <FormSelectMultiple id="citizens" :options="state.options.citizens" v-model="state.formShift.citizens" />
            <FormError :error="v$?.formShift?.citizens?.$errors[0]?.$message.toString()" />
            <FormError :error="state?.error?.errors?.citizen_uuid?.[0]" />
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
                    {{ props.formType === 'create' ? $t('save') :
                        $t('update') }}
                </FormButton>
            </div>
        </div>
    </form>
</template>

<script setup lang="ts">
import moment from 'moment'
import { citizenService } from '@/components/api/user/CitizenService'
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
    formType: {
        type: String,
        required: true,
    },
    selectedEmployee: {
        type: Object,
        required: true,
    },
    selectedShift: {
        type: Object,
        required: true,
    },
})
const { t } = useI18n()
const emit = defineEmits(['close', 'isPageLoading', 'saveShift'])
const language = useI18n()
const state = reactive({
    error: {} as Error,
    formShift: {
        shift_type: '',
        date_time_start: moment().startOf('day').add(8, 'hours').format('YYYY-MM-DD H:mm'),
        date_time_end: moment().startOf('day').add(17, 'hours').format('YYYY-MM-DD H:mm'),
        citizens: [],
        in_meeting: false,
        use_compensatory_time: false,
    },
    showChildProtectionCertificateWarning: false,
    options: {
        citizens: [],
        shifts: []
    }
})

onMounted(() => {
    state.showChildProtectionCertificateWarning = false
    v$.value.$reset()
    fetchAllShifts()
    fetchAllCitizensPerUserDepartment()
    state.formShift.shift_type = props.selectedShift.shift_type
    state.formShift.date_time_start = props.selectedShift.date_time_start
    state.formShift.date_time_end = props.selectedShift.date_time_end
    state.formShift.in_meeting = props.selectedShift.in_meeting
    state.formShift.citizens = props.selectedShift.citizens
})

watch(() => state.formShift.shift_type, (newValue) => {
    const selectShiftIndex = state.options.shifts.findIndex(shift => shift.value === newValue)
    if (![3, 4].includes(selectShiftIndex)) {
        state.showChildProtectionCertificateWarning = true
    } else {
        state.showChildProtectionCertificateWarning = false
    }
})

const rules = computed(() => {
    const selectShiftIndex = state.options.shifts.findIndex(shift => shift.value === state.formShift.shift_type)
    if ([3, 4].includes(selectShiftIndex)) {
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
    } else {
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
                citizens: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
            },
        }
    }
})
const v$ = useVuelidate(rules, state)

function closeModal() {
    emit('close')
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

async function fetchAllCitizensPerUserDepartment() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const params = {
            user_uuid: props.selectedEmployee?.uuid
        }
        const response = await citizenService.getAllCitizensPerUserDepartment(params)
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (citizen: any) => options.push({
                    value: citizen?.uuid,
                    label: citizen?.firstname + " " + citizen?.lastname,
                })
            )
            state.options.citizens = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
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