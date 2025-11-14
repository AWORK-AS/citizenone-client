<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="space-y-1">
                <FormLabel for="inquiry_date" :label="$t('inquiries.form.dateOfInquiry')" />
                <FormDateField id="inquiry_date" name="inquiry_date" :placeholder="$t('inquiries.form.dateOfInquiry')"
                    v-model="state.formInquiry.inquiry_date" />
                <FormError :error="v$?.formInquiry?.inquiry_date?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.inquiry_date?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="inquirer_name" :label="$t('inquiries.form.inquirerName')" />
                <FormTextField id="inquirer_name" name="inquirer_name" :placeholder="$t('inquiries.form.inquirerName')"
                    v-model="state.formInquiry.inquirer_name" />
                <FormError :error="v$?.formInquiry?.inquirer_name?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.inquirer_name?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="first_name" :label="$t('inquiries.form.firstname')" />
                <FormTextField id="first_name" name="first_name" :placeholder="$t('inquiries.form.firstname')"
                    v-model="state.formInquiry.first_name" />
                <FormError :error="v$?.formInquiry?.first_name?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.first_name?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="last_name" :label="$t('inquiries.form.lastname')" />
                <FormTextField id="last_name" name="last_name" :placeholder="$t('inquiries.form.lastname')"
                    v-model="state.formInquiry.last_name" />
                <FormError :error="v$?.formInquiry?.last_name?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.last_name?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="outcome" :label="$t('inquiries.form.outcome')" />
                <FormTextField id="outcome" name="outcome" :placeholder="$t('inquiries.form.outcome')"
                    v-model="state.formInquiry.outcome" />
                <FormError :error="v$?.formInquiry?.outcome?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.outcome?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="purpose" :label="$t('inquiries.form.purpose')" />
                <FormTextField id="purpose" name="purpose" :placeholder="$t('inquiries.form.purpose')"
                    v-model="state.formInquiry.purpose" />
                <FormError :error="v$?.formInquiry?.purpose?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.purpose?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="conversation_summary" :label="$t('inquiries.form.conversationSummary')" />
                <FormTextArea id="conversation_summary" name="conversation_summary"
                    :placeholder="$t('inquiries.form.conversationSummary')"
                    v-model="state.formInquiry.conversation_summary" />
                <FormError :error="v$?.formInquiry?.conversation_summary?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.conversation_summary?.[0]" />
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="emit('closeModal')">
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

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedInquiry: {
        type: Object,
        required: false,
    },
})
const emit = defineEmits(['closeModal', 'isPageLoading', 'submitForm'])

const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formInquiry: {
        inquiry_date: '',
        inquirer_name: '',
        first_name: '',
        last_name: '',
        outcome: '',
        purpose: '',
        conversation_summary: '',
    },
})

onMounted(() => {
    state.formInquiry = {
        inquiry_date: props.selectedInquiry?.inquiry_date,
        inquirer_name: props.selectedInquiry?.inquirer_name,
        first_name: props.selectedInquiry?.first_name,
        last_name: props.selectedInquiry?.last_name,
        outcome: props.selectedInquiry?.outcome,
        purpose: props.selectedInquiry?.purpose,
        conversation_summary: props.selectedInquiry?.conversation_summary,
    }
})

watch(() => props.selectedInquiry, (newValue: any) => {
    if (newValue != null) {
        state.formInquiry = {
            inquiry_date: newValue.inquiry_date,
            inquirer_name: newValue.inquirer_name,
            first_name: newValue.first_name,
            last_name: newValue.last_name,
            outcome: newValue.outcome,
            purpose: newValue.purpose,
            conversation_summary: newValue.conversation_summary,
        }
    }
})

const rules = computed(() => {
    return {
        formInquiry: {
            inquiry_date: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            inquirer_name: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            conversation_summary: {
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
        emit('submitForm', state.formInquiry)
    }
}
</script>