<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <form @submit.prevent="submitForm()" class="mt-6" id="formShiftRequest">
            <Alert type="danger" :text="props?.error?.message"
                v-if="props.error?.message && props.error.message.length > 0" />
            <Alert type="danger" :text="state?.error?.message"
                v-if="state.error?.message && state.error.message.length > 0" />
            <div class="space-y-3">
                <div class="space-y-1">
                    <FormLabel for="date" :label="$t('dutySchedules.shiftRequests.form.date')" />
                    <FormDateField id="date" name="date" :placeholder="$t('dutySchedules.shiftRequests.form.date')"
                        v-model="state.formShiftRequest.date" />
                    <FormError :error="v$?.formShiftRequest?.date?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.date_time_start?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="shift_type" :label="$t('dutySchedules.shiftRequests.form.shiftType')" />
                    <FormSelect id="shift_type" name="shift_type" :options="state.options.shiftTypes"
                        v-model="state.formShiftRequest.shift_type_uuid" />
                    <FormError :error="v$?.formShiftRequest?.shift_type_uuid?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.shift_type_uuid?.[0]" />
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <FormLabel for="time_in" :label="$t('dutySchedules.shiftRequests.form.timeIn')" />
                        <FormTimeField id="time_in" name="time_in"
                            :placeholder="$t('dutySchedules.shiftRequests.form.timeIn')"
                            v-model="state.formShiftRequest.time_in" />
                        <FormError :error="v$?.formShiftRequest?.time_in?.$errors[0]?.$message.toString()" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="time_out" :label="$t('dutySchedules.shiftRequests.form.timeOut')" />
                        <FormTimeField id="time_out" name="time_out"
                            :placeholder="$t('dutySchedules.shiftRequests.form.timeOut')"
                            v-model="state.formShiftRequest.time_out" />
                        <FormError :error="v$?.formShiftRequest?.time_out?.$errors[0]?.$message.toString()" />
                    </div>
                </div>
                <div class="space-y-1">
                    <FormLabel for="department" :label="$t('dutySchedules.shiftRequests.form.department')" />
                    <FormSelect id="department" name="department" :options="state.options.departments"
                        v-model="state.formShiftRequest.department_uuids[0]" />
                    <FormError :error="props?.error?.errors?.department_uuids?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="note" :label="$t('dutySchedules.shiftRequests.form.note')" />
                    <FormTextArea id="note" name="note" :placeholder="$t('dutySchedules.shiftRequests.form.note')"
                        v-model="state.formShiftRequest.note" />
                    <FormError :error="props?.error?.errors?.note?.[0]" />
                </div>
            </div>
            <div class="mt-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormButton type="button" buttonStyle="cancel" @click="closeModal" :disabled="props.isModalLoading">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton type="submit" buttonStyle="primary" :disabled="props.isModalLoading">
                        {{ $t('dutySchedules.shiftRequests.form.sendRequest') }}
                    </FormButton>
                </div>
            </div>
        </form>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { shiftService } from '@/components/api/user/ShiftService'
import { departmentService } from '@/components/api/user/DepartmentService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useDepartmentStore } from '@/store/department'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    isModalLoading: {
        type: Boolean,
        default: false,
    },
})
const emit = defineEmits(['isPageLoading', 'submitForm', 'closeModal'])
const { t } = useI18n()
const language = useI18n()
const departmentStore = useDepartmentStore() as any

const state = reactive({
    error: {} as Error,
    formShiftRequest: {
        date: '',
        shift_type_uuid: '',
        time_in: '08:00',
        time_out: '16:00',
        department_uuids: [] as any,
        note: '',
    },
    isPageLoading: false,
    options: {
        departments: [] as any,
        shiftTypes: [] as any,
    },
})

onMounted(() => {
    fetchShiftTypes()
    fetchDepartments()
})

function closeModal() {
    if (props.isModalLoading || state.isPageLoading) return
    emit('closeModal')
}

const rules = computed(() => {
    return {
        formShiftRequest: {
            date: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            shift_type_uuid: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            time_in: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            time_out: {
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
        emit('submitForm', state.formShiftRequest)
    }
}

async function fetchShiftTypes() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            department: departmentStore.getSelectedDepartmentName,
        }
        const response = await shiftService.getAllShifts(params)
        if (response?.data) {
            state.options.shiftTypes = response.data.map((shift: any) => ({
                value: shift?.uuid,
                label: language.locale.value === 'en' ? shift?.en_name :
                    language.locale.value === 'no' ? shift?.no_name :
                        language.locale.value === 'sv' ? shift?.sv_name :
                            shift?.dk_name,
            }))
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchDepartments() {
    try {
        const response = await departmentService.getAllDepartments({})
        if (response) {
            state.options.departments = response.data.map((item: any) => ({
                value: item.uuid,
                label: item.name,
            }))
            if (!['All departments', 'Alle afdelinger'].includes(departmentStore.getSelectedDepartmentName) && departmentStore.getSelectedDepartment?.uuid) {
                state.formShiftRequest.department_uuids = [departmentStore.getSelectedDepartment.uuid]
            }
        }
    } catch (error: any) {
        state.error = error
    }
}
</script>
