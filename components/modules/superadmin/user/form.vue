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
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                    @click="navigateTo('/superadmin/users')">
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
    } as UserForm,
    modal: {
        isAddDepartmentOpen: false
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
        }
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
</script>