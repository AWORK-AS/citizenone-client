<template>
    <div>
        <Modal size="md" :title="props.citizen ? $t('employees.citizens.editWeeklyHours') : $t('employees.citizens.assignCitizens')"
            :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="assignCitizen()" id="formGroupMember">
                        <div class="space-y-1">
                            <p class="text-sm text-gray-600">
                                {{ props.citizen ? $t('citizens.interventionHours.view.citizen') : $t('employees.citizens.citizens') }}
                            </p>
                            <p v-if="props.citizen" class="text-sm font-medium text-gray-900">
                                {{ [props.citizen.firstname, props.citizen.lastname].filter(Boolean).join(' ') }}
                            </p>
                            <FormSelect v-else id="citizens" :options="state.options.citizens"
                                v-model="state.formAssignCitizen.citizen_uuid" class="w-full" />
                            <FormError :error="v$?.formAssignCitizen?.citizen_uuid?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.citizen_uuid?.[0]" />
                        </div>
                        <!-- Hours a week, only when the company uses them. Empty means none. -->
                        <div v-if="weeklyHoursOn" class="space-y-1 mt-4">
                            <FormLabel for="weekly_hours" :label="$t('employees.citizens.weeklyHoursQuestion')" />
                            <FormTextField id="weekly_hours" name="weekly_hours" inputmode="decimal"
                                :placeholder="$t('employees.citizens.weeklyHoursPlaceholder')"
                                v-model="state.formAssignCitizen.weekly_hours" />
                            <p class="text-xs text-gray-500">{{ $t('employees.citizens.weeklyHoursHint') }}</p>
                            <FormError :error="v$?.formAssignCitizen?.weekly_hours?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.weekly_hours?.[0]" />
                        </div>
                        <div class="mt-6">
                            <FormButton type="submit" class="w-full" buttonStyle="primary">
                                {{ props.citizen ? $t('employees.citizens.save') : $t('employees.citizens.assign') }}
                            </FormButton>
                        </div>
                    </form>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>

</template>

<script setup lang="ts">
import { citizenService } from '@/components/api/user/CitizenService'
import { employeeService } from '@/components/api/user/EmployeeService'
import { useDepartmentStore } from '@/store/department'
import { useUserStore } from '@/store/user'
import { isContactWeeklyHoursOn, parseWeeklyHours } from '@/composables/citizenWeeklyHours'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const router = useRouter()
const departmentStore = useDepartmentStore()
const userStore = useUserStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()
const employeeUuid = router?.currentRoute?.value?.params?.employee_uuid

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    // An assigned citizen whose hours a week are changed; none when assigning a new one.
    citizen: {
        type: Object,
        default: null,
    },
})

const weeklyHoursOn = computed(() => isContactWeeklyHoursOn(userStore.getUser?.company))

const state = reactive({
    error: {} as Error,
    isTableLoading: false,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
    isPageLoading: false,
    formAssignCitizen: {
        citizen_uuid: '',
        weekly_hours: '' as string | number,
    },
    options: {
        citizens: []
    },
})

const emit = defineEmits(['close'])

function closeModal() {
    emit('close')
}

const rules = computed(() => {
    return {
        formAssignCitizen: {
            citizen_uuid: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            weekly_hours: {
                validHours: helpers.withMessage(() => `${t('employees.citizens.weeklyHoursInvalid')}.`, (value: unknown) => {
                    if (value === null || value === undefined || String(value).trim() === '') {
                        return true
                    }
                    const hours = parseWeeklyHours(value)
                    return hours !== null && hours >= 0 && hours <= 168
                }),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

watch(() => props.isModalOpen, (isOpen: any) => {
    if (isOpen) {
        state.error = {}
        v$.value.$reset()
        if (props.citizen) {
            state.formAssignCitizen.citizen_uuid = props.citizen.uuid
            state.formAssignCitizen.weekly_hours = props.citizen.contact_weekly_hours ?? ''
            return
        }
        state.formAssignCitizen.citizen_uuid = ''
        state.formAssignCitizen.weekly_hours = ''
        fetchAvailableCitizens()
    }
})

async function fetchAvailableCitizens() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            department: departmentStore.getSelectedDepartmentName,
            user_uuid: employeeUuid,
        }
        const response = await citizenService.getAllAssignee(params)
        if (response) {
            state.options.citizens = response
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.firstname + " " + (item.lastname ? item.lastname : ''),
                })
            )
            state.options.citizens = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

async function assignCitizen() {
    v$.value.$validate()
    if (!v$.value.$error) {
        state.error = {}
        state.isPageLoading = true
        try {
            const params: Record<string, any> = {
                citizen_uuid: state.formAssignCitizen.citizen_uuid,
            }
            if (weeklyHoursOn.value) {
                params.weekly_hours = parseWeeklyHours(state.formAssignCitizen.weekly_hours)
            }
            const response = await employeeService.assignCitizen(employeeUuid, params)
            if (response?.data) {
                successAlert(`${t('alert.success')}!`, props.citizen
                    ? `${t('employees.citizens.weeklyHoursSaved')}.`
                    : `${t('reminders.form.alert.employeeSuccessfullyAssigned')}.`)
                if (!props.citizen) {
                    fetchAvailableCitizens()
                }
                closeModal()
                state.formAssignCitizen.citizen_uuid = ''
                state.formAssignCitizen.weekly_hours = ''
                v$.value.$reset()
            }
        } catch (error: any) {
            state.error = error
        }
        state.isPageLoading = false
    }
}
</script>

<style>
#formGroupMember .multiselect-dropdown {
    max-height: 5rem !important;
}
</style>