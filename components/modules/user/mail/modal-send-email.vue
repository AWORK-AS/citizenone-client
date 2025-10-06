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
                                <FormMultipleEmailAddresses id="recipient" name="recipient"
                                    :placeholder="$t('mail.form.to')" v-model="state.formEmail.recipient" />
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
                            <div class="space-y-1">
                                <div class="w-fit flex items-center cursor-pointer"
                                    @click="state.formEmail.encrypt_message = !state.formEmail.encrypt_message">
                                    <FormCheckbox :value="state.formEmail.encrypt_message" />
                                    {{ $t('mail.form.encryptMessage') }}
                                </div>
                            </div>
                            <div class="space-y-1" v-if="state.formEmail.encrypt_message">
                                <FormLabel for="password" :label="$t('mail.form.password')" />
                                <FormTextField id="password" name="password" :placeholder="$t('mail.form.password')"
                                    v-model="state.formEmail.password" />
                                <FormError :error="v$?.formEmail?.password?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.password?.[0]" />
                            </div>
                            <div class="space-y-1" v-if="state.formEmail.encrypt_message">
                                <FormLabel for="password_hint" :label="$t('mail.form.passwordHint')" />
                                <FormTextField id="password_hint" name="password"
                                    :placeholder="$t('mail.form.passwordHint')"
                                    v-model="state.formEmail.password_hint" />
                                <FormError :error="v$?.formEmail?.password_hint?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.password_hint?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <div class="flex flex-col items-center">
                                    <input type="file" ref="file" @change="onFileChange" class="hidden" multiple />
                                    <div class="relative cursor-pointer" @click="triggerFileInput">
                                        <Icon name="ic:outline-drive-folder-upload" class="h-36 w-36"
                                            aria-hidden="true" />
                                        <div
                                            class="rounded-full absolute inset-0 bg-black bg-opacity-50 text-white opacity-0 hover:opacity-100 transition-opacity">
                                            <div class="flex items-center w-full h-full justify-center text-xs">
                                                {{ $t('selectFiles') }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div v-if="state.formEmail.files && state.formEmail.files.length"
                                    class="mt-2 text-sm text-gray-700">
                                    <ul class="list-disc pl-5">
                                        <li v-for="(file, fileIndex) in state.formEmail.files" :key="fileIndex">
                                            {{ file.name }} ({{ (file.size / 1024).toFixed(1) }} KB)
                                        </li>
                                    </ul>
                                </div>
                                <FormError :error="state?.error?.errors?.files?.[0]" class="text-center" />
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
import { ref, reactive, computed, watch } from 'vue'
import { mailSMTPService } from '@/components/api/user/MailSMTPService'
import { useVuelidate } from '@vuelidate/core'
import { required, helpers } from '@vuelidate/validators'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedContact: {
        type: Object,
        required: false,
    },
})

const emit = defineEmits(['close', 'refreshSentEmails'])
const { successAlert } = useAlert()
const { t } = useI18n()
const file = ref<HTMLInputElement | null>(null)

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formEmail: {
        recipient: [] as any,
        subject: '',
        content: '',
        encrypt_message: false,
        password: '',
        password_hint: '',
        files: [] as File[],
    },
})

watch(() => props.selectedContact, (selectedContact: any) => {
    if (selectedContact?.email) {
        state.formEmail.recipient = [selectedContact.email]
    }
})

const rules = computed(() => {
    if (state.formEmail.encrypt_message) {
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
                password: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
            },
        }
    } else {
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
    }
})

const v$ = useVuelidate(rules, state)

function closeModal() {
    emit('close')
}

function triggerFileInput() {
    if (file.value) {
        file.value.click()
    }
}

function onFileChange(event: Event) {
    const input = event.target as HTMLInputElement
    const files = input.files ? Array.from(input.files) : []
    state.formEmail.files = files
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
        const formData = new FormData()
        formData.append('recipient', JSON.stringify(state.formEmail.recipient))
        formData.append('subject', state.formEmail.subject)
        formData.append('content', state.formEmail.content)
        if (state.formEmail.encrypt_message) {
            formData.append('is_encrypted', String(state.formEmail.encrypt_message))
            formData.append('password', state.formEmail.password)
            formData.append('password_hint', state.formEmail.password_hint)
        }
        state.formEmail.files.forEach((f) => formData.append('files[]', f))
        const response = await mailSMTPService.sendMail(formData)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('mail.form.alert.emailSuccessfullySent')}.`)
            emit('refreshSentEmails')
            state.formEmail = {
                recipient: [],
                subject: '',
                content: '',
                encrypt_message: false,
                password: '',
                password_hint: '',
                files: [],
            }
            v$.value.$reset()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
