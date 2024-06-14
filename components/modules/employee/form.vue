<template>
    <form @submit.prevent="submitForm()" class="mt-6 max-w-3xl">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error && props.error.length > 0 || props.error?.message" />
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
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="space-y-1">
                    <FormLabel for="email" :label="$t('employees.form.emailAddress')" />
                    <FormTextField id="email" name="email" :placeholder="$t('employees.form.emailAddress')"
                        v-model="state.formEmployee.email" />
                    <FormError :error="v$?.formEmployee?.email?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.email?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="phone" :label="$t('employees.form.phone')" />
                    <FormTextField id="phone" name="phone" :placeholder="$t('employees.form.phone')"
                        v-model="state.formEmployee.phone" />
                    <FormError :error="v$?.formEmployee?.phone?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.phone?.[0]" />
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="space-y-1">
                    <FormLabel for="birthday" :label="$t('employees.form.birthday')" />
                    <FormDateField id="birthday" name="birthday" :placeholder="$t('employees.form.birthday')"
                        v-model="state.formEmployee.birthday" />
                    <FormError :error="v$?.formEmployee?.birthday?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.birthday?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="role" :label="$t('employees.form.role')" />
                    <FormSelect id="role" name="role" :options="state.roleOptions" v-model="state.formEmployee.role" />
                    <FormError :error="v$?.formEmployee?.role?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.role?.[0]" />
                </div>
            </div>
            <div class="space-y-1">
                <FormLabel for="address" :label="$t('employees.form.address')" />
                <FormTextField id="address" name="address" :placeholder="$t('employees.form.address')"
                    v-model="state.formEmployee.address" />
                <FormError :error="v$?.formEmployee?.address?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.address?.[0]" />
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
    </form>
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"

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
    error: [],
    formEmployee: {
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        birthday: '',
        role: '',
        address: '',
    },
    roleOptions: [
        { value: 'Admin', label: 'Admin' },
        { value: 'User', label: 'User' },
    ]
})

watch(() => props.selectedEmployee, (newValue: any) => {
    if (newValue != null) {
        state.formEmployee = {
            firstname: newValue.firstname,
            lastname: newValue.lastname,
            email: newValue.email,
            phone: newValue.phone,
            birthday: newValue.birthday,
            role: newValue.role,
            address: newValue.address,
        }
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
            address: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            }
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formEmployee)
    }
}
</script>