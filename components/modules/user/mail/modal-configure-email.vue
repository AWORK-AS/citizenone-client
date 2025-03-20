<template>
    <div>
        <Modal size="sm" :title="$t('mail.connectYourMail')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="submitForm()">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="space-y-3">
                            <div class="space-y-1">
                                <FormLabel for="smtp_host" :label="$t('mail.settings.smtpHost')" />
                                <FormTextField id="smtp_host" name="smtp_host"
                                    :placeholder="$t('mail.settings.smtpHost')" v-model="state.formMail.smtp_host" />
                                <FormError :error="v$?.formMail?.smtp_host?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.smtp_host?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="smtp_port" :label="$t('mail.settings.smtpPort')" />
                                <FormTextField id="smtp_port" name="smtp_port"
                                    :placeholder="$t('mail.settings.smtpPort')" v-model="state.formMail.smtp_port" />
                                <FormError :error="v$?.formMail?.smtp_port?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.smtp_port?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="smtp_username" :label="$t('mail.settings.smtpUsername')" />
                                <FormTextField id="smtp_username" name="smtp_username"
                                    :placeholder="$t('mail.settings.smtpUsername')"
                                    v-model="state.formMail.smtp_username" />
                                <FormError :error="v$?.formMail?.smtp_username?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.smtp_username?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="smtp_password" :label="$t('mail.settings.smtpPassword')" />
                                <FormPasswordField id="smtp_password" name="smtp_password"
                                    :placeholder="$t('mail.settings.smtpPassword')"
                                    v-model="state.formMail.smtp_password" />
                                <FormError :error="v$?.formMail?.smtp_password?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.smtp_password?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="smtp_encryption" :label="$t('mail.settings.smtpEncryption')" />
                                <FormTextField id="smtp_encryption" name="smtp_encryption"
                                    :placeholder="$t('mail.settings.smtpEncryption')"
                                    v-model="state.formMail.smtp_encryption" />
                                <FormError :error="v$?.formMail?.smtp_encryption?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.smtp_encryption?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="imap_host" :label="$t('mail.settings.imapHost')" />
                                <FormTextField id="imap_host" name="imap_host"
                                    :placeholder="$t('mail.settings.imapHost')" v-model="state.formMail.imap_host" />
                                <FormError :error="v$?.formMail?.imap_host?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.imap_host?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="imap_port" :label="$t('mail.settings.imapPort')" />
                                <FormTextField id="imap_port" name="imap_port"
                                    :placeholder="$t('mail.settings.imapPort')" v-model="state.formMail.imap_port" />
                                <FormError :error="v$?.formMail?.imap_port?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.imap_port?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="imap_username" :label="$t('mail.settings.imapUsername')" />
                                <FormTextField id="imap_username" name="imap_username"
                                    :placeholder="$t('mail.settings.imapUsername')"
                                    v-model="state.formMail.imap_username" />
                                <FormError :error="v$?.formMail?.imap_username?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.imap_username?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="imap_password" :label="$t('mail.settings.imapPassword')" />
                                <FormPasswordField id="imap_password" name="imap_password"
                                    :placeholder="$t('mail.settings.imapPassword')"
                                    v-model="state.formMail.imap_password" />
                                <FormError :error="v$?.formMail?.imap_password?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.imap_password?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="imap_encryption" :label="$t('mail.settings.portEncryption')" />
                                <FormTextField id="imap_encryption" name="imap_encryption"
                                    :placeholder="$t('mail.settings.portEncryption')"
                                    v-model="state.formMail.imap_encryption" />
                                <FormError :error="v$?.formMail?.imap_encryption?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.imap_encryption?.[0]" />
                            </div>
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                                    @click="emit('close')">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary" class="rounded-md">
                                    {{ props.formType === 'create' ? $t('mail.settings.connect') :
                                        $t('update') }}
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
import { mailSettingService } from "@/components/api/user/MailSettingService"
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    formType: {
        type: String,
        required: true,
    },
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})

const emit = defineEmits(['close'])
const { successAlert } = useAlert()
const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formMail: {
        smtp_host: '',
        smtp_port: '',
        smtp_username: '',
        smtp_password: '',
        smtp_encryption: '',
        imap_host: '',
        imap_port: '',
        imap_username: '',
        imap_password: '',
        imap_encryption: '',
    },
})

const rules = computed(() => {
    return {
        formMail: {
            smtp_host: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            smtp_port: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            smtp_username: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            smtp_password: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            imap_host: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            imap_port: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            imap_username: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            imap_password: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

watch(() => props.isModalOpen, (isModalOpen) => {
    if (isModalOpen) {
        fetchEmailConfiguration()
    }
})

function closeModal() {
    emit('close')
}

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        saveEmailConfiguration()
    }
}

async function fetchEmailConfiguration() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await mailSettingService.getMailSettings()
        if (response?.data) {
            state.formMail = {
                smtp_host: response?.data?.smtp_host?.toString(),
                smtp_port: response?.data?.smtp_port?.toString(),
                smtp_username: response?.data?.smtp_username?.toString(),
                smtp_password: response?.data?.smtp_password?.toString(),
                smtp_encryption: response?.data?.smtp_encryption?.toString(),
                imap_host: response?.data?.imap_host?.toString(),
                imap_port: response?.data?.imap_port?.toString(),
                imap_username: response?.data?.imap_username?.toString(),
                imap_password: response?.data?.imap_password?.toString(),
                imap_encryption: response?.data?.imap_encryption?.toString(),
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function saveEmailConfiguration() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            smtp_host: state.formMail.smtp_host,
            smtp_port: state.formMail.smtp_port,
            smtp_username: state.formMail.smtp_username,
            smtp_password: state.formMail.smtp_password,
            smtp_encryption: state.formMail.smtp_encryption,
            imap_host: state.formMail.imap_host,
            imap_port: state.formMail.imap_port,
            imap_username: state.formMail.imap_username,
            imap_password: state.formMail.imap_password,
            imap_encryption: state.formMail.imap_encryption,
        }
        const response = await mailSettingService.saveUpdateMailSettings(params)
        if (response?.data) {
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('mail.settings.alert.mailConfigurationSuccessfullySaved')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>