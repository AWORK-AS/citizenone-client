<template>
    <div>
        <Modal size="xs" :title="`${$t('filter')}`" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <form @submit.prevent="filterDistribution">
                    <div class="space-y-3">
                        <div class="space-y-1">
                            <FormLabel for="employee_uuid" :label="$t('dutySchedules.filter.employee')" />
                            <FormSelect id="employee_uuid" :options="state.options.employees"
                                v-model="state.formFilter.employee_uuid" />
                            <FormError :error="v$?.formFilter.employee_uuid?.$errors[0]?.$message.toString()" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="date_time_start" :label="$t('dutySchedules.filter.dateTimeStart')" />
                            <FormDateTimeField id="date_time_start" name="date_time_start"
                                :placeholder="$t('dutySchedules.filter.dateTimeStart')"
                                v-model="state.formFilter.date_time_start" />
                            <FormError :error="v$?.formFilter.date_time_start?.$errors[0]?.$message.toString()" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="date_time_end" :label="$t('dutySchedules.filter.dateTimeEnd')" />
                            <FormDateTimeField id="date_time_end" name="date_time_end"
                                :placeholder="$t('dutySchedules.filter.dateTimeEnd')"
                                v-model="state.formFilter.date_time_end" />
                            <FormError :error="v$?.formFilter.date_time_end?.$errors[0]?.$message.toString()" />
                        </div>
                    </div>
                    <div class="mt-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" @click="closeModal">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="submit" buttonStyle="primary" class="w-full">
                                {{ $t('filter') }}
                            </FormButton>
                        </div>
                    </div>
                </form>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { userService } from '@/components/api/user/UserService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useDepartmentStore } from '@/store/department'
import type { Error } from '@/types'
import { useI18n } from "vue-i18n"

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    formFilter: {
        type: Object,
        required: true,
    },
    selectedEmployee: {
        type: Object,
        required: false,
    },
})

const { t } = useI18n()
const emit = defineEmits(['close', 'filterDistribution'])
const departmentStore = useDepartmentStore()

const state = reactive({
    error: {} as Error,
    formFilter: {
        date_time_end: '',
        date_time_start: '',
        employee_uuid: '',
    } as any,
    isPageLoading: false,
    options: {
        employees: [] as any,
    }
})

watch(() => props.isModalOpen, (isModalOpen) => {
    if (isModalOpen) {
        state.error = {}
        state.formFilter = {
            date_time_end: moment(props?.formFilter?.date_time_end).format('YYYY-MM-DD HH:mm'),
            date_time_start: moment(props?.formFilter?.date_time_start).format('YYYY-MM-DD HH:mm'),
            employee_uuid: '',
        }
        fetchAllUsers()
    }
})

const rules = computed(() => {
    return {
        formFilter: {
            date_time_end: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            date_time_start: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            employee_uuid: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        }
    }
})

const v$ = useVuelidate(rules, state)

function closeModal() {
    emit('close')
}

async function fetchAllUsers() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            department: departmentStore.getSelectedDepartmentName
        }
        const response = await userService.getAllUsers(params)
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (user: any) => options.push({
                    value: user?.uuid,
                    label: user?.firstname + " " + (user?.lastname ?? ''),
                    uuid: user?.uuid,
                    firstname: user?.firstname,
                    lastname: user?.lastname ?? '',
                })
            )
            state.options.employees = options
            state.formFilter.employee_uuid = props.selectedEmployee?.uuid || options[0]?.value
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function filterDistribution() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('filterDistribution', {
            ...state.formFilter,
            employee: state.options.employees.find((employee: any) => employee.value === state.formFilter.employee_uuid) || '',
        })
        closeModal()
    }
}
</script>