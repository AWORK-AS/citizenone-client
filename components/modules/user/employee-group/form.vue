<template>
    <form @submit.prevent="submitForm()" class="mt-6 max-w-xl pb-16">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-1">
            <FormLabel for="name" :label="$t('employeeGroups.form.name')" />
            <FormTextField id="name" name="name" :placeholder="$t('employeeGroups.form.name')"
                v-model="state.formEmployeeGroup.name" />
            <FormError :error="v$?.formEmployeeGroup?.name?.$errors[0]?.$message.toString()" />
            <FormError :error="props?.error?.errors?.name?.[0]" />
        </div>
        <div class="space-y-1">
            <FormLabel for="department_uuid"
                :label="customPagesStore.getCustomPagesName?.department ?? $t('employeeGroups.form.department')" />
            <FormSelect id="department_uuid" name="department_uuid" :options="state.options.departments"
                v-model="state.formEmployeeGroup.department_uuid" />
            <FormError :error="v$?.formEmployeeGroup?.department_uuid?.$errors[0]?.$message.toString()" />
            <FormError :error="props?.error?.errors?.department_uuid?.[0]" />
        </div>
        <div class="space-y-1">
            <FormLabel for="employees_uuid" :label="$t('employeeGroups.form.employees')" />
            <FormSelectMultiple id="employees_uuid" name="employees_uuid" :options="state.options.employees"
                v-model="state.formEmployeeGroup.employees_uuid" />
            <FormError :error="v$?.formEmployeeGroup?.name?.$errors[0]?.$message.toString()" />
            <FormError :error="props?.error?.errors?.name?.[0]" />
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                    @click="navigateTo('/settings/employee-groups')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary" class="rounded-md">
                    {{ props.formType === 'create' ? $t('save') :
                        $t('update') }}
                </FormButton>
            </div>
        </div>
    </form>
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'
import { userService } from "@/components/api/user/UserService"
import { useDepartmentStore } from '@/store/department'
import { departmentService } from "@/components/api/user/DepartmentService"
import { useCustomPagesStore } from '@/store/custom-pages'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedEmployeeGroup: {
        type: Object,
        required: false,
    },
})
const emit = defineEmits(['isPageLoading', 'submitForm'])
const customPagesStore = useCustomPagesStore() as any
const { t } = useI18n()
const departmentStore = useDepartmentStore()

const state = reactive({
    isPageLoading: false,
    error: {} as Error,
    formEmployeeGroup: {
        name: '',
        department_uuid: '',
        employees_uuid: [] as string[],
    },
    options: {
        employees: [] as any,
        departments: [] as any,
    }
})

onMounted(() => {
    if (props.formType === 'update') {
        state.formEmployeeGroup.name = props.selectedEmployeeGroup?.name || ''
        state.formEmployeeGroup.department_uuid = props.selectedEmployeeGroup?.department_uuid || ''
        state.formEmployeeGroup.employees_uuid = props.selectedEmployeeGroup?.employees_uuid || []
    }
    fetchAllEmployees()
    fetchAllDepartments()
})

async function fetchAllDepartments() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const params = {}
        const response = await departmentService.getAllDepartments(params)
        if (response) {
            let options: any = []
            response.data.forEach(
                (item: any) => {
                    if (item.id) {
                        options.push({
                            value: item?.uuid,
                            label: item?.name,
                        })
                    }
                }
            )
            state.options.departments = options
            if (props.formType === 'create') {
                state.formEmployeeGroup.department_uuid = ''
                if (!['All departments', 'Alle afdelinger'].includes(departmentStore.getSelectedDepartmentName)) {
                    state.formEmployeeGroup.department_uuid = departmentStore.getSelectedDepartment?.uuid || ''
                }
            }
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

async function fetchAllEmployees() {
    state.error = {}
    emit('isPageLoading', true)
    try {
        const params = {
            department: departmentStore.getSelectedDepartmentName
        }
        const response = await userService.getAllUsers(params)
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (user: any) => {
                    if (user.id) {
                        options.push({
                            value: user?.uuid,
                            label: user?.firstname + " " + (user?.lastname ?? ''),
                        })
                    }
                }
            )
            state.options.employees = options
        }
    } catch (error: any) {
        state.error = error
    }
    emit('isPageLoading', false)
}

// function changeEmployeesUuid(employeesUuid: any) {
//     if (employeesUuid) {
//         state.formEmployeeGroup.employees_uuid = employeesUuid
//     } else {
//         state.formEmployeeGroup.employees_uuid = []
//     }
// }

watch(() => props.selectedEmployeeGroup, (newValue: any) => {
    if (newValue != null) {
        if (props.formType === 'update') {
            state.formEmployeeGroup.name = props.selectedEmployeeGroup?.name || ''
            state.formEmployeeGroup.department_uuid = props.selectedEmployeeGroup?.department_uuid || ''
            state.formEmployeeGroup.employees_uuid = props.selectedEmployeeGroup?.employees_uuid || []
        }
    }
})

const rules = computed(() => {
    return {
        formEmployeeGroup: {
            name: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formEmployeeGroup)
    }
}
</script>