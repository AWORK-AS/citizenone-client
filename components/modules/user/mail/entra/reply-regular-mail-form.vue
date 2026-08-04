<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <form @submit.prevent="submitForm()">
            <Alert type="danger" :text="state?.error?.message"
                v-if="state.error?.message && state.error.message.length > 0" />
            <div class="space-y-3">
                <div class="space-y-1">
                    <FormLabel for="content" :label="$t('mail.form.message')" />
                    <FormTextArea id="content" name="content" :placeholder="$t('mail.form.message')"
                        v-model="state.formEmail.content" />
                    <FormError :error="v$?.formEmail?.content?.$errors[0]?.$message.toString()" />
                    <FormError :error="state?.error?.errors?.content?.[0]" />
                </div>
                <!--
                    Replies and forwards leave the platform encrypted or not at
                    all (AW-2026-2744). The recipient opens the message with
                    this password, and the hint tells them which one to use.
                -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-3">
                    <div class="space-y-1">
                        <FormLabel for="password" :label="$t('mail.form.createCode')" />
                        <FormTextField id="password" name="password" :placeholder="$t('mail.form.enterCode')"
                            v-model="state.formEmail.password" />
                        <FormError :error="v$?.formEmail?.password?.$errors[0]?.$message.toString()" />
                        <FormError :error="state?.error?.errors?.password?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="password_hint" :label="$t('mail.form.passwordHint')" />
                        <FormTextField id="password_hint" name="password_hint"
                            :placeholder="$t('mail.form.passwordHintPlaceholder')"
                            v-model="state.formEmail.password_hint" />
                        <FormError :error="v$?.formEmail?.password_hint?.$errors[0]?.$message.toString()" />
                        <FormError :error="state?.error?.errors?.password_hint?.[0]" />
                    </div>
                </div>
            </div>
            <div class="mt-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormButton type="button" buttonStyle="cancel" @click="emit('close')">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton type="submit" buttonStyle="primary">
                        {{ $t('mail.form.send') }}
                    </FormButton>
                </div>
            </div>
        </form>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { mailEntraService } from "@/components/api/user/MailEntraService"
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
        content: '',
        password: '',
        password_hint: '',
    },
})

const rules = computed(() => {
    return {
        formEmail: {
            password: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            password_hint: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            content: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
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
        const emailId = props.selectedEmail?.id
        const params = {
            message: state.formEmail.content,
            password: state.formEmail.password,
            password_hint: state.formEmail.password_hint,
        }
        const response = await mailEntraService.replyMail(emailId, params)
        if (response) {
            successAlert(`${t('alert.success')}!`, `${t('mail.form.alert.emailSuccessfullySent')}.`)
            closeForm()
            state.formEmail = {
                content: '',
                password: '',
                password_hint: '',
            }
            v$.value.$reset()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>