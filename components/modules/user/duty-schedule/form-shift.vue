<template>
    <form @submit.prevent="saveShift()" id="formShift">
        <div class="space-y-3">
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
                        :placeholder="`${$t('dutySchedules.form.dateTimeEnd')}`"
                        v-model="state.formShift.date_time_end" />
                    <FormError :error="v$?.formShift.date_time_end?.$errors[0]?.$message.toString()" />
                </div>
            </div>
            <div class="space-y-1" v-if="props.formType === 'create'">
                <div class="w-fit flex items-center cursor-pointer"
                    @click="state.formShift.is_recurring = !state.formShift.is_recurring">
                    <FormCheckbox :value="state.formShift.is_recurring" />
                    {{ $t('dutySchedules.form.createMultipleSchedules') }}
                </div>
            </div>
            <div class="space-y-3" v-if="state.formShift.is_recurring">
                <div class="space-y-1">
                    <FormLabel for="recurring" :label="$t('dutySchedules.form.recurring.repeat')" />
                    <FormSelect id="recurring" :options="state.options.recurringSchedules"
                        v-model="state.formShift.recurring" />
                    <FormError :error="v$?.formShift?.recurring?.$errors[0]?.$message.toString()" />
                    <FormError :error="state?.error?.errors?.recurring_uuid?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="recurring_until" :label="$t('dutySchedules.form.recurring.until')" />
                    <FormDateField id="recurring_until" name="recurring_until"
                        :placeholder="`${$t('dutySchedules.form.recurring.until')}`"
                        v-model="state.formShift.recurring_until" />
                    <FormError :error="v$?.formShift.recurring_until?.$errors[0]?.$message.toString()" />
                    <FormError :error="state?.error?.errors?.recurring_until?.[0]" />
                </div>
            </div>
            <div class="space-y-1" v-if="props.formType === 'update'">
                <div class="w-fit flex items-center cursor-pointer"
                    @click="state.formShift.is_apply_to_all = !state.formShift.is_apply_to_all">
                    <FormCheckbox :value="state.formShift.is_apply_to_all" />
                    {{ $t('dutySchedules.form.recurring.applyChangesToAllRecurringShifts') }}
                </div>
            </div>
            <div class="space-y-1"
                v-if="!(['vacation-leave', 'sick-leave'].includes(state.options.shifts.find((shift: any) => shift.value === state.formShift.shift_type)?.system_name))">
                <FormLabel for="citizens" :label="$t('dutySchedules.form.citizens')" />
                <FormSelectMultiple id="citizens" :options="state.options.citizens"
                    v-model="state.formShift.citizens" />
                <FormError :error="v$?.formShift?.citizens?.$errors[0]?.$message.toString()" />
                <FormError :error="state?.error?.errors?.citizen_uuid?.[0]" />
            </div>
            <div
                v-if="['vacation-leave'].includes(state.options.shifts.find((shift: any) => shift.value === state.formShift.shift_type)?.system_name)">
                <div class="w-fit flex items-center cursor-pointer"
                    @click="state.formShift.use_compensatory_time = !state.formShift.use_compensatory_time">
                    <FormCheckbox :value="state.formShift.use_compensatory_time" />
                    {{ $t('dutySchedules.form.useCompensatoryTime') }}
                </div>
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
                    :options="state.options.scheduleTags" v-model="state.formShift.schedule_tag_uuid" />
                <FormError :error="v$?.formShift?.schedule_tag_uuid?.$errors[0]?.$message.toString()" />
                <FormError :error="state?.error?.errors?.schedule_tag_uuid?.[0]" />
            </div>
            <div class="space-y-1">
                <div class="flex justify-between items-center py-0.5">
                    <FormLabel for="department_uuid" :label="$t('dutySchedules.form.departments')" />
                    <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                        @click="state.modal.isAddDepartmentOpen = true">
                        {{ $t('departments.addNewDepartment') }}
                    </span>
                </div>
                <FormSelectMultiple id="department_uuid" name="department_uuid" :options="state.options.departments"
                    v-model="state.formShift.department_uuid" />
                <FormError :error="v$?.formShift?.department_uuid?.$errors[0]?.$message.toString()" />
                <FormError :error="state?.error?.errors?.department_uuid?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="note" :label="`${$t('dutySchedules.form.note')}.`" />
                <FormTextArea id="note" name="note" :placeholder="$t('dutySchedules.form.note')"
                    v-model="state.formShift.note" />
                <FormError :error="v$?.formShift?.note?.$errors[0]?.$message.toString()" />
                <FormError :error="state?.error?.errors?.note?.[0]" />
            </div>
            <div class="space-y-1"
                v-if="(['sick-leave'].includes(state.options.shifts.find((shift: any) => shift.value === state.formShift.shift_type)?.system_name))">
                <div class="w-fit flex items-center cursor-pointer"
                    @click="state.formShift.count_sick_leave = !state.formShift.count_sick_leave">
                    <FormCheckbox id="count_sick_leave" :value="state.formShift.count_sick_leave" />
                    {{ $t('dutySchedules.form.countSickLeaveAsWorkedHours') }}
                </div>
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
        <ModulesUserScheduleTagModalNew :isModalOpen="state.modal.isAddNewScheduleTagOpen"
            @close="state.modal.isAddNewScheduleTagOpen = false" @refreshScheduleTags="fetchAllCalendarTags" />
        <ModulesUserDepartmentModalNew :isModalOpen="state.modal.isAddDepartmentOpen"
            @close="state.modal.isAddDepartmentOpen = false" @refreshDepartments="fetchAllDepartments" />
    </form>
</template>

<script setup lang="ts">
import moment from 'moment'
import { departmentService } from '@/components/api/user/DepartmentService'
import { scheduleTagService } from '@/components/api/user/ScheduleTagService'
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
        is_recurring: false,
        recurring: '',
        recurring_until: '',
        is_apply_to_all: false,
        citizens: [],
        schedule_tag_uuid: [],
        department_uuid: [],
        use_compensatory_time: false,
        note: '',
        count_sick_leave: false,
    },
    modal: {
        isAddDepartmentOpen: false,
        isAddNewScheduleTagOpen: false,
    },
    showChildProtectionCertificateWarning: false,
    options: {
        citizens: [],
        departments: [],
        recurringSchedules: [
            { value: 'everyday', label: `${t('dutySchedules.form.recurring.everyDay')}` },
            { value: 'every_week', label: `${t('dutySchedules.form.recurring.everyWeek')}` },
            { value: 'every_second_week', label: `${t('dutySchedules.form.recurring.everySecondWeek')}` },
            { value: 'every_third_week', label: `${t('dutySchedules.form.recurring.everyThirdWeek')}` },
            { value: 'every_fourth_week', label: `${t('dutySchedules.form.recurring.everyFourthWeek')}` },
            { value: 'every_month', label: `${t('dutySchedules.form.recurring.everyMonth')}` },
        ],
        scheduleTags: [],
        shifts: [] as any
    }
})

onMounted(() => {
    state.showChildProtectionCertificateWarning = false
    v$.value.$reset()
    fetchAllShifts()
    fetchAllCalendarTags()
    fetchAllDepartments()
    fetchAllScheduleTags()
    fetchAllCitizensPerUserDepartment()
    state.formShift.shift_type = props.selectedShift.shift_type
    state.formShift.date_time_start = props.selectedShift.date_time_start
    state.formShift.date_time_end = props.selectedShift.date_time_end
    state.formShift.citizens = props.selectedShift.citizens
    state.formShift.schedule_tag_uuid = props.selectedShift.schedule_tag_uuid
    state.formShift.department_uuid = props.selectedShift.department_uuid
    state.formShift.note = props.selectedShift.note
    state.formShift.count_sick_leave = props.selectedShift.count_sick_leave
})

watch(() => state.formShift.shift_type, (selectedShift) => {
    const selectShiftIndex = state.options.shifts.findIndex((shift: any) => shift.value === selectedShift)
    if (![3, 4].includes(selectShiftIndex)) {
        state.showChildProtectionCertificateWarning = true
    } else {
        state.showChildProtectionCertificateWarning = false
    }

    if (props.formType === 'create') {
        const startDate = moment(props.selectedShift.date_time_start, 'YYYY-MM-DD H:mm')
        const endDate = moment(props.selectedShift.date_time_end, 'YYYY-MM-DD H:mm')

        state.formShift.date_time_start = moment(
            startDate.format('YYYY-MM-DD') + ' ' + state.options.shifts[selectShiftIndex]?.time_in,
            'YYYY-MM-DD HH:mm'
        ).format('YYYY-MM-DD H:mm')

        state.formShift.date_time_end = moment(
            endDate.format('YYYY-MM-DD') + ' ' + state.options.shifts[selectShiftIndex]?.time_out,
            'YYYY-MM-DD HH:mm'
        ).format('YYYY-MM-DD H:mm')
    }

})

const rules = computed(() => {
    if (state.formShift.is_recurring) {
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
                recurring: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                recurring_until: {
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
                    system_name: shift?.system_name,
                    time_in: shift?.time_in,
                    time_out: shift?.time_out,
                })
            )
            state.options.shifts = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

async function fetchAllCalendarTags() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const response = await scheduleTagService.getAllScheduleTags()
        if (response?.data) {
            let options: any = []
            response.data.forEach(
                (tag: any) => options.push({
                    value: tag?.uuid,
                    label: tag?.tag,
                })
            )
            state.options.scheduleTags = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}



async function fetchAllDepartments() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const params = {
            employee_uuid: props?.selectedEmployee?.uuid
        }
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

async function fetchAllScheduleTags() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const response = await scheduleTagService.getAllScheduleTags()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (tag: any) => options.push({
                    value: tag?.uuid,
                    label: tag?.tag,
                })
            )
            state.options.scheduleTags = options
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
    max-height: 5rem !important;
}
</style>