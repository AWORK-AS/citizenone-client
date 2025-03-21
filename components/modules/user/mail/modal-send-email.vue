<template>
    <div>
        <Modal size="sm" :title="$t('mail.compose')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="submitForm()">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="space-y-3">
                            <div class="space-y-1">
                                <FormLabel for="recipient" :label="$t('mail.form.to')" />
                                <FormTextField id="recipient" name="recipient" :placeholder="$t('mail.form.to')"
                                    v-model="state.formEmail.recipient" />
                                <FormError :error="v$?.formEmail?.recipient?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.recipient?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="subject" :label="$t('mail.form.subject')" />
                                <FormTextField id="subject" name="subject" :placeholder="$t('mail.form.subject')"
                                    v-model="state.formEmail.subject" />
                                <FormError :error="v$?.formEmail?.subject?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.subject?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="content" :label="$t('mail.form.message')" />
                                <FormTextArea id="content" name="content" :placeholder="$t('mail.form.message')"
                                    v-model="state.formEmail.content" />
                                <FormError :error="v$?.formEmail?.content?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.content?.[0]" />
                            </div>
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                                    @click="emit('close')">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary" class="rounded-md">
                                    {{ $t('mail.form.send') }}
                                </FormButton>
                            </div>
                        </div>
                    </form>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { mailService } from "@/components/api/user/MailService"
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
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
        recipient: '',
        subject: '',
        content: '',
    },
})

const rules = computed(() => {
    return {
        formEmail: {
            recipient: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            subject: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            content: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function closeModal() {
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
        const params = {
            recipient: state.formEmail.recipient,
            subject: state.formEmail.subject,
            content: state.formEmail.content,
        }
        const response = await mailService.sendMail(params)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('mail.form.alert.emailSuccessfullySent')}.`)
            emit('refreshSentEmails')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>