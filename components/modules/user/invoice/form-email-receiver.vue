<template>
    <form @submit.prevent="submitForm()" class="mt-6">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="space-y-1">
                <FormLabel for="firstname" :label="$t('invoices.email.form.firstname')" />
                <FormTextField id="firstname" name="firstname" :placeholder="$t('invoices.email.form.firstname')"
                    v-model="state.formInvoiceReceiver.firstname" />
                <FormError :error="v$?.formInvoiceReceiver?.firstname?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.firstname?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="lastname" :label="$t('invoices.email.form.lastname')" />
                <FormTextField id="lastname" name="lastname" :placeholder="$t('invoices.email.form.lastname')"
                    v-model="state.formInvoiceReceiver.lastname" />
                <FormError :error="v$?.formInvoiceReceiver?.lastname?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.lastname?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="email" :label="$t('invoices.email.form.email')" />
                <FormTextField id="email" name="email" :placeholder="$t('invoices.email.form.email')"
                    v-model="state.formInvoiceReceiver.email" />
                <FormError :error="v$?.formInvoiceReceiver?.email?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.email?.[0]" />
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" @click="emit('closeModal')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary">
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

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedInvoiceReceiver: {
        type: Object,
        required: false,
    },
})
const emit = defineEmits(['closeModal', 'isPageLoading', 'submitForm'])
const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formInvoiceReceiver: {
        firstname: props.selectedInvoiceReceiver?.firstname || '',
        lastname: props.selectedInvoiceReceiver?.lastname || '',
        email: props.selectedInvoiceReceiver?.email || '',
    },
})

watch(() => props.selectedInvoiceReceiver, (newValue: any) => {
    if (newValue != null) {
        state.formInvoiceReceiver = {
            firstname: newValue.firstname,
            lastname: newValue.lastname,
            email: newValue.email,
        }
    }
})

const rules = computed(() => {
    return {
        formInvoiceReceiver: {
            firstname: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            lastname: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            email: {
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
        emit('submitForm', state.formInvoiceReceiver)
    }
}
</script>