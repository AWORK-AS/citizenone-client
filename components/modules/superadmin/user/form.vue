<template>
    <form @submit.prevent="submitForm()" class="mt-6 max-w-3xl">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <div class="grid grid-cols-1 gap-y-3">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="space-y-1">
                    <FormLabel for="firstname" :label="$t('superadmin.users.form.firstname')" />
                    <FormTextField id="firstname" name="firstname" :placeholder="$t('superadmin.users.form.firstname')"
                        v-model="state.formUser.firstname" />
                    <FormError :error="v$?.formUser?.firstname?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.firstname?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="lastname" :label="$t('superadmin.users.form.lastname')" />
                    <FormTextField id="lastname" name="lastname" :placeholder="$t('superadmin.users.form.lastname')"
                        v-model="state.formUser.lastname" />
                    <FormError :error="v$?.formUser?.lastname?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.lastname?.[0]" />
                </div>
            </div>
            <div class="space-y-1">
                <FormLabel for="email" :label="$t('superadmin.users.form.emailAddress')" />
                <FormTextField id="email" name="email" :placeholder="$t('superadmin.users.form.emailAddress')"
                    v-model="state.formUser.email" />
                <FormError :error="v$?.formUser?.email?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.email?.[0]" />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="space-y-1">
                    <FormLabel for="phone" :label="$t('superadmin.users.form.phone')" />
                    <FormTextField id="phone" name="phone" :placeholder="$t('superadmin.users.form.phone')"
                        v-model="state.formUser.phone" />
                    <FormError :error="v$?.formUser?.phone?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.phone?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="birthday" :label="$t('superadmin.users.form.birthday')" />
                    <FormDateField id="birthday" name="birthday" :placeholder="$t('superadmin.users.form.birthday')"
                        v-model="state.formUser.birthday" />
                    <FormError :error="v$?.formUser?.birthday?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.birthday?.[0]" />
                </div>
            </div>
            <div class="space-y-1">
                <FormLabel for="permissions" :label="$t('superadmin.users.form.permissions.permissions')" />
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                    <div class="w-fit flex items-center cursor-pointer" @click="changePermissionRead()">
                        <FormCheckbox id="permissions" :value="state.permissions.read" />
                        {{ $t('superadmin.users.form.permissions.read') }}
                    </div>
                    <div class="w-fit flex items-center cursor-pointer" @click="changePermissionCreate()">
                        <FormCheckbox id="permissions_create" :value="state.permissions.create" />
                        {{ $t('superadmin.users.form.permissions.create') }}
                    </div>
                    <div class="w-fit flex items-center cursor-pointer" @click="changePermissionUpdate()">
                        <FormCheckbox id="permissions_update" :value="state.permissions.update" />
                        {{ $t('superadmin.users.form.permissions.update') }}
                    </div>
                    <div class="w-fit flex items-center cursor-pointer" @click="changePermissionDelete()">
                        <FormCheckbox id="permissions_delete" :value="state.permissions.delete" />
                        {{ $t('superadmin.users.form.permissions.delete') }}
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
            @close="state.modal.isAddDepartmentOpen = false" />
    </form>
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import type { UserForm, Error } from '@/types'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedUser: {
        type: Object,
        required: false,
    },
})
const emit = defineEmits(['isPageLoading', 'submitForm'])

const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formUser: {
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        birthday: '',
        permissions: [],
    } as UserForm,
    modal: {
        isAddDepartmentOpen: false
    },
    permissions: {
        read: false,
        create: false,
        update: false,
        delete: false,
    },
})

watch(() => props.selectedUser, (newValue: any) => {
    if (newValue != null) {
        state.formUser = {
            firstname: newValue.firstname,
            lastname: newValue.lastname,
            email: newValue.email,
            phone: newValue.phone,
            birthday: newValue.birthday,
            permissions: [],
        }
        newValue?.permissions.forEach((permission: any) => {
            if (permission?.name === 'read') {
                state.permissions.read = true
                state.formUser.permissions.push("read")
            } else if (permission?.name === 'create') {
                state.permissions.create = true
                state.formUser.permissions.push("create")
            } else if (permission?.name === 'update') {
                state.permissions.update = true
                state.formUser.permissions.push("update")
            } else if (permission?.name === 'delete') {
                state.permissions.delete = true
                state.formUser.permissions.push("delete")
            }
        })
    }
})

const rules = computed(() => {
    return {
        formUser: {
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
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formUser)
    }
}

function changePermissionRead() {
    state.permissions.read = !state.permissions.read
    if (state.permissions.read) {
        state.formUser.permissions.push("read")
    } else {
        removePermission('read')
    }
}

function changePermissionCreate() {
    state.permissions.create = !state.permissions.create
    if (state.permissions.create) {
        state.formUser.permissions.push("create")
    } else {
        removePermission('create')
    }
}

function changePermissionUpdate() {
    state.permissions.update = !state.permissions.update
    if (state.permissions.update) {
        state.formUser.permissions.push("update")
    } else {
        removePermission('update')
    }
}

function changePermissionDelete() {
    state.permissions.delete = !state.permissions.delete
    if (state.permissions.delete) {
        state.formUser.permissions.push("delete")
    } else {
        removePermission('delete')
    }
}

function removePermission(permissionToRemove: string) {
    state.formUser.permissions = state.formUser.permissions.filter((permission: any) => permission !== permissionToRemove);
}
</script>