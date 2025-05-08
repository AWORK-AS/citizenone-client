<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <form @submit.prevent="submitForm()">
            <Alert type="danger" :text="state?.error?.message"
                v-if="state.error?.message && state.error.message.length > 0" />
            <div class="space-y-3">
                <div class="space-y-1">
                    <FormLabel for="email" :label="$t('mail.form.to')" />
                    <FormMultipleEmailAddresses id="email" name="email" :placeholder="$t('mail.form.to')"
                        v-model="state.formEmail.email" />
                    <FormError :error="v$?.formEmail?.email?.$errors[0]?.$message.toString()" />
                    <FormError :error="state?.error?.errors?.email?.[0]" />
                </div>
            </div>
            <div class="mt-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="emit('close')">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton type="submit" buttonStyle="primary" class="rounded-md">
                        {{ $t('mail.forward') }}
                    </FormButton>
                </div>
            </div>
        </form>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { mailService } from "@/components/api/user/MailService"
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    selectedEmail: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['close', 'refreshSentEmails'])
const { successAlert } = useAlert()
const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formEmail: {
        email: [],
    },
})

const rules = computed(() => {
    return {
        formEmail: {
            email: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        }
    }
})

const v$ = useVuelidate(rules, state)

function closeForm() {
    emit('close')
}

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        sendEmail()
    }
}

async function sendEmail() {
    state.error = {}
    state.isPageLoading = true
    try {
        const emailUid = props.selectedEmail?.header?.uid
        const params = {
            email: state.formEmail.email,
        }
        const response = await mailService.forwardMail(emailUid, params)
        if (response?.message) {
            successAlert(`${t('alert.success')}!`, `${t('mail.form.alert.emailSuccessfullyFowarded')}.`)
            closeForm()
            state.formEmail = {
                email: [],
            }
            v$.value.$reset()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>