<template>
    <form @submit.prevent="submitForm()" class="mt-6 max-w-3xl">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <div class="grid grid-cols-1 gap-y-3">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="space-y-1">
                    <FormLabel for="firstname" :label="$t('employees.form.firstname')" />
                    <FormTextField id="firstname" name="firstname" :placeholder="$t('employees.form.firstname')"
                        v-model="state.formEmployee.firstname" />
                    <FormError :error="v$?.formEmployee?.firstname?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.firstname?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="lastname" :label="$t('employees.form.lastname')" />
                    <FormTextField id="lastname" name="lastname" :placeholder="$t('employees.form.lastname')"
                        v-model="state.formEmployee.lastname" />
                    <FormError :error="v$?.formEmployee?.lastname?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.lastname?.[0]" />
                </div>
            </div>
            <div class="space-y-1">
                <FormLabel for="email" :label="$t('employees.form.emailAddress')" />
                <FormTextField id="email" name="email" :placeholder="$t('employees.form.emailAddress')"
                    v-model="state.formEmployee.email" />
                <FormError :error="v$?.formEmployee?.email?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.email?.[0]" />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="space-y-1">
                    <FormLabel for="phone" :label="$t('employees.form.phone')" />
                    <FormTextField id="phone" name="phone" :placeholder="$t('employees.form.phone')"
                        v-model="state.formEmployee.phone" />
                    <FormError :error="v$?.formEmployee?.phone?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.phone?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="birthday" :label="$t('employees.form.birthday')" />
                    <FormDateField id="birthday" name="birthday" :placeholder="$t('employees.form.birthday')"
                        v-model="state.formEmployee.birthday" />
                    <FormError :error="v$?.formEmployee?.birthday?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.birthday?.[0]" />
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="space-y-1">
                    <div class="flex justify-between items-center py-0.5">
                        <FormLabel for="department" :label="$t('employees.form.department')" />
                        <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                            @click="state.modal.isAddDepartmentOpen = true">
                            {{ $t('departments.addNewDepartment') }}
                        </span>
                    </div>
                    <FormSelectMultiple id="departments" :options="state.options.departments"
                        v-model="state.formEmployee.departments" />
                    <FormError :error="v$?.formEmployee?.departments?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.department_id?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="role" :label="$t('employees.form.role')" />
                    <FormSelect id="role" name="role" :options="state.options.roleOptions"
                        v-model="state.formEmployee.role" />
                    <FormError :error="v$?.formEmployee?.role?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.role?.[0]" />
                </div>
            </div>
            <div class="space-y-1">
                <FormLabel for="permissions" :label="$t('employees.form.permissions.permissions')" />
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                    <div class="w-fit flex items-center cursor-pointer" @click="changePermissionRead()">
                        <FormCheckbox id="permissions" :value="state.permissions.read" />
                        {{ $t('employees.form.permissions.read') }}
                    </div>
                    <div class="w-fit flex items-center cursor-pointer" @click="changePermissionCreate()">
                        <FormCheckbox id="permissions_create" :value="state.permissions.create" />
                        {{ $t('employees.form.permissions.create') }}
                    </div>
                    <div class="w-fit flex items-center cursor-pointer" @click="changePermissionUpdate()">
                        <FormCheckbox id="permissions_update" :value="state.permissions.update" />
                        {{ $t('employees.form.permissions.update') }}
                    </div>
                    <div class="w-fit flex items-center cursor-pointer" @click="changePermissionDelete()">
                        <FormCheckbox id="permissions_delete" :value="state.permissions.delete" />
                        {{ $t('employees.form.permissions.delete') }}
                    </div>
                </div>
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="navigateTo('/employees')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary" class="rounded-md">
                    {{ props.formType === 'create' ? $t('save') :
                        $t('update') }}
                </FormButton>
            </div>
        </div>
        <ModulesDepartmentModalNew :isModalOpen="state.modal.isAddDepartmentOpen"
            @close="state.modal.isAddDepartmentOpen = false" @refreshDepartment="fetchDepartments" />
    </form>
</template>

<script setup lang="ts">
import { departmentService } from '@/components/api/DepartmentService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import type { EmployeeForm, Error } from '@/types'

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
        required: false,
    },
})
const emit = defineEmits(['isPageLoading', 'submitForm'])

const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formEmployee: {
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        birthday: '',
        departments: [],
        role: '',
        permissions: [],
    } as EmployeeForm,
    modal: {
        isAddDepartmentOpen: false
    },
    permissions: {
        read: false,
        create: false,
        update: false,
        delete: false,
    },
    options: {
        departments: [],
        roleOptions: [
            { value: 'Admin', label: 'Admin' },
            { value: 'User', label: 'User' },
        ]
    }
})

watch(() => props.selectedEmployee, (newValue: any) => {
    if (newValue != null) {
        state.formEmployee = {
            firstname: newValue.firstname,
            lastname: newValue.lastname,
            email: newValue.email,
            phone: newValue.phone,
            birthday: newValue.birthday,
            departments: newValue.departments,
            role: newValue.role,
            permissions: [],
        }
        newValue?.permissions.forEach((permission: any) => {
            if (permission?.name === 'read') {
                state.permissions.read = true
                state.formEmployee.permissions.push("read")
            } else if (permission?.name === 'create') {
                state.permissions.create = true
                state.formEmployee.permissions.push("create")
            } else if (permission?.name === 'update') {
                state.permissions.update = true
                state.formEmployee.permissions.push("update")
            } else if (permission?.name === 'delete') {
                state.permissions.delete = true
                state.formEmployee.permissions.push("delete")
            }
        })
    }
})

const rules = computed(() => {
    return {
        formEmployee: {
            firstname: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            lastname: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            email: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            phone: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            birthday: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            role: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

onMounted(() => {
    fetchDepartments()
})

async function fetchDepartments() {
    emit('isPageLoading', true)
    state.error = {}
    try {
        const response = await departmentService.getAllDepartments()
        if (response) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.id,
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

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formEmployee)
    }
}

function changePermissionRead() {
    state.permissions.read = !state.permissions.read
    if (state.permissions.read) {
        state.formEmployee.permissions.push("read")
    } else {
        removePermission('read')
    }
}

function changePermissionCreate() {
    state.permissions.create = !state.permissions.create
    if (state.permissions.create) {
        state.formEmployee.permissions.push("create")
    } else {
        removePermission('create')
    }
}

function changePermissionUpdate() {
    state.permissions.update = !state.permissions.update
    if (state.permissions.update) {
        state.formEmployee.permissions.push("update")
    } else {
        removePermission('update')
    }
}

function changePermissionDelete() {
    state.permissions.delete = !state.permissions.delete
    if (state.permissions.delete) {
        state.formEmployee.permissions.push("delete")
    } else {
        removePermission('delete')
    }
}

function removePermission(permissionToRemove: string) {
    state.formEmployee.permissions = state.formEmployee.permissions.filter((permission: any) => permission !== permissionToRemove);
}
</script>