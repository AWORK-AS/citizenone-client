<template>
    <form @submit.prevent="submitForm()" class="mt-6 max-w-3xl">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <div class="grid grid-cols-1 gap-y-3">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="space-y-1">
                    <FormLabel for="firstname" :label="$t('superadmin.accounts.form.firstname')" />
                    <FormTextField id="firstname" name="firstname"
                        :placeholder="$t('superadmin.accounts.form.firstname')" v-model="state.formAccount.firstname" />
                    <FormError :error="v$?.formAccount?.firstname?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.firstname?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="lastname" :label="$t('superadmin.accounts.form.lastname')" />
                    <FormTextField id="lastname" name="lastname" :placeholder="$t('superadmin.accounts.form.lastname')"
                        v-model="state.formAccount.lastname" />
                    <FormError :error="v$?.formAccount?.lastname?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.lastname?.[0]" />
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="space-y-1">
                    <FormLabel for="email" :label="$t('superadmin.accounts.form.emailAddress')" />
                    <FormTextField id="email" name="email" :placeholder="$t('superadmin.accounts.form.emailAddress')"
                        v-model="state.formAccount.email" />
                    <FormError :error="v$?.formAccount?.email?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.email?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="phone" :label="$t('superadmin.accounts.form.phone')" />
                    <FormTextField id="phone" name="phone" :placeholder="$t('superadmin.accounts.form.phone')"
                        v-model="state.formAccount.phone" />
                    <FormError :error="v$?.formAccount?.phone?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.phone?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="birthday" :label="$t('superadmin.accounts.form.birthday')" />
                    <FormDateField id="birthday" name="birthday" :placeholder="$t('superadmin.accounts.form.birthday')"
                        v-model="state.formAccount.birthday" />
                    <FormError :error="v$?.formAccount?.birthday?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.birthday?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="role" :label="$t('superadmin.accounts.form.role')" />
                    <FormSelect id="role" name="role" :options="state.options.roleOptions"
                        v-model="state.formAccount.role" />
                    <FormError :error="v$?.formEmployee?.role?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.role?.[0]" />
                </div>
            </div>
            <div class="space-y-1">
                <div class="w-fit flex items-center cursor-pointer"
                    @click="state.isChangePassword = !state.isChangePassword">
                    <FormCheckbox id="change_password" :value="state.isChangePassword" />
                    {{ $t('superadmin.accounts.form.changePassword') }}
                </div>
            </div>
            <div class="space-y-1" v-if="state.isChangePassword">
                <FormLabel for="password" :label="$t('superadmin.accounts.form.password')" />
                <FormPasswordField id="password" name="password" :placeholder="$t('superadmin.accounts.form.password')"
                    v-model="state.formAccount.password" />
                <FormError :error="v$?.formAccount?.password?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.password?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="permissions" :label="$t('superadmin.accounts.form.permissions.permissions')" />
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                    <div class="w-fit flex items-center cursor-pointer" @click="changePermissionRead()">
                        <FormCheckbox id="permissions" :value="state.permissions.read" />
                        {{ $t('superadmin.accounts.form.permissions.read') }}
                    </div>
                    <div class="w-fit flex items-center cursor-pointer" @click="changePermissionCreate()">
                        <FormCheckbox id="permissions_create" :value="state.permissions.create" />
                        {{ $t('superadmin.accounts.form.permissions.create') }}
                    </div>
                    <div class="w-fit flex items-center cursor-pointer" @click="changePermissionUpdate()">
                        <FormCheckbox id="permissions_update" :value="state.permissions.update" />
                        {{ $t('superadmin.accounts.form.permissions.update') }}
                    </div>
                    <div class="w-fit flex items-center cursor-pointer" @click="changePermissionDelete()">
                        <FormCheckbox id="permissions_delete" :value="state.permissions.delete" />
                        {{ $t('superadmin.accounts.form.permissions.delete') }}
                    </div>
                </div>
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                    @click="navigateTo(`/superadmin/companies/${companyUuid}/accounts`)">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary" class="rounded-md">
                    {{ props.formType === 'create' ? $t('save') :
                        $t('update') }}
                </FormButton>
            </div>
        </div>
        <ModulesUserDepartmentModalNew :isModalOpen="state.modal.isAddDepartmentOpen"
            @close="state.modal.isAddDepartmentOpen = false" />
    </form>
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import type { AccountForm, Error } from '@/types'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedAccount: {
        type: Object,
        required: false,
    },
})
const emit = defineEmits(['isPageLoading', 'submitForm'])

const { t } = useI18n()
const router = useRouter()
const companyUuid = router?.currentRoute?.value?.params?.company_uuid

const state = reactive({
    error: {} as Error,
    formAccount: {
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        birthday: '',
        role: '',
        password: '',
        permissions: [],
    } as AccountForm,
    isChangePassword: false,
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
        roleOptions: [
            { value: 'Admin', label: 'Admin' },
            { value: 'User', label: 'User' },
        ]
    }
})

watch(() => props.selectedAccount, (newValue: any) => {
    if (newValue != null) {
        state.formAccount = {
            firstname: newValue.firstname,
            lastname: newValue.lastname,
            email: newValue.email,
            phone: newValue.phone,
            birthday: newValue.birthday,
            role: newValue.role,
            password: '',
            permissions: [],
        }
        newValue?.permissions.forEach((permission: any) => {
            if (permission?.name === 'read') {
                state.permissions.read = true
                state.formAccount.permissions.push("read")
            } else if (permission?.name === 'create') {
                state.permissions.create = true
                state.formAccount.permissions.push("create")
            } else if (permission?.name === 'update') {
                state.permissions.update = true
                state.formAccount.permissions.push("update")
            } else if (permission?.name === 'delete') {
                state.permissions.delete = true
                state.formAccount.permissions.push("delete")
            }
        })
    }
})

const rules = computed(() => {
    if (state.isChangePassword) {
        return {
            formAccount: {
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
                password: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
            },
        }
    } else {
        return {
            formAccount: {
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
            },
        }
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formAccount)
    }
}

function changePermissionRead() {
    state.permissions.read = !state.permissions.read
    if (state.permissions.read) {
        state.formAccount.permissions.push("read")
    } else {
        removePermission('read')
    }
}

function changePermissionCreate() {
    state.permissions.create = !state.permissions.create
    if (state.permissions.create) {
        state.formAccount.permissions.push("create")
    } else {
        removePermission('create')
    }
}

function changePermissionUpdate() {
    state.permissions.update = !state.permissions.update
    if (state.permissions.update) {
        state.formAccount.permissions.push("update")
    } else {
        removePermission('update')
    }
}

function changePermissionDelete() {
    state.permissions.delete = !state.permissions.delete
    if (state.permissions.delete) {
        state.formAccount.permissions.push("delete")
    } else {
        removePermission('delete')
    }
}

function removePermission(permissionToRemove: string) {
    state.formAccount.permissions = state.formAccount.permissions.filter((permission: any) => permission !== permissionToRemove);
}
</script>