<template>
    <div>
        <Modal size="sm" :title="$t('citizens.documents.sendLink.title')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="submitForm()">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="space-y-4">
                            <div class="flex items-center gap-x-3 rounded-lg bg-gray-50 px-4 py-3">
                                <Icon :name="props.selectedDocument?.type === 'folder' ? 'ph:folder' : 'ph:file'"
                                    class="size-5 shrink-0 text-primary" aria-hidden="true" />
                                <div class="min-w-0">
                                    <p class="truncate text-sm font-medium text-gray-900">
                                        {{ props.selectedDocument?.name }}
                                    </p>
                                    <p class="text-xs text-gray-600">
                                        {{ props.selectedDocument?.type === 'folder'
                                            ? $t('citizens.documents.sendLink.folderIntro')
                                            : $t('citizens.documents.sendLink.fileIntro') }}
                                    </p>
                                </div>
                            </div>

                            <div class="space-y-1">
                                <FormLabel for="share_link_emails" :label="$t('citizens.documents.sendLink.recipients')" />
                                <FormMultipleEmailAddresses id="share_link_emails" name="share_link_emails"
                                    :placeholder="$t('citizens.documents.sendLink.recipientsPlaceholder')"
                                    v-model="state.form.emails" />
                                <p class="text-xs text-gray-500">{{ $t('citizens.documents.sendLink.recipientsHelp') }}</p>
                                <FormError :error="v$?.form?.emails?.$errors[0]?.$message.toString()" />
                                <FormError :error="firstServerError('emails')" />
                            </div>

                            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div class="space-y-1">
                                    <FormLabel for="share_link_password" :label="$t('citizens.documents.sendLink.password')" />
                                    <FormPasswordField id="share_link_password" name="share_link_password"
                                        :placeholder="$t('citizens.documents.sendLink.password')"
                                        v-model="state.form.password" />
                                    <FormError :error="v$?.form?.password?.$errors[0]?.$message.toString()" />
                                    <FormError :error="firstServerError('password')" />
                                </div>
                                <div class="space-y-1">
                                    <FormLabel for="share_link_password_confirmation"
                                        :label="$t('citizens.documents.sendLink.confirmPassword')" />
                                    <FormPasswordField id="share_link_password_confirmation"
                                        name="share_link_password_confirmation"
                                        :placeholder="$t('citizens.documents.sendLink.confirmPassword')"
                                        v-model="state.form.password_confirmation" />
                                    <FormError
                                        :error="v$?.form?.password_confirmation?.$errors[0]?.$message.toString()" />
                                </div>
                            </div>
                            <p class="-mt-2 flex items-start gap-x-2 text-xs text-gray-600">
                                <Icon name="ph:info" class="mt-px size-4 shrink-0" aria-hidden="true" />
                                {{ $t('citizens.documents.sendLink.passwordHelp') }}
                            </p>

                            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div class="space-y-1">
                                    <FormLabel for="share_link_expires_at" :label="$t('citizens.documents.sendLink.expiresAt')" />
                                    <FormDateField id="share_link_expires_at" name="share_link_expires_at"
                                        :placeholder="$t('citizens.documents.sendLink.expiresAt')"
                                        :minDate="today" :maxDate="latestExpiry"
                                        v-model="state.form.expires_at" />
                                    <FormError :error="v$?.form?.expires_at?.$errors[0]?.$message.toString()" />
                                    <FormError :error="firstServerError('expires_at')" />
                                </div>
                                <div class="space-y-1">
                                    <FormLabel for="share_link_language" :label="$t('citizens.documents.sendLink.emailLanguage')" />
                                    <FormSelect id="share_link_language" :options="languageOptions" :canClear="false"
                                        :canDeselect="false" :searchable="false" :appendToBody="true"
                                        :placeholder="$t('citizens.documents.sendLink.emailLanguage')"
                                        v-model="state.form.language" />
                                </div>
                            </div>

                            <div class="space-y-1">
                                <FormLabel for="share_link_message" :label="$t('citizens.documents.sendLink.message')" />
                                <FormTextArea id="share_link_message" name="share_link_message" :rows="3"
                                    :placeholder="$t('citizens.documents.sendLink.messagePlaceholder')"
                                    v-model="state.form.message" />
                                <FormError :error="firstServerError('message')" />
                            </div>
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" @click="closeModal">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary">
                                    <Icon name="ph:paper-plane-tilt" class="size-4" aria-hidden="true" />
                                    {{ $t('citizens.documents.sendLink.send') }}
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
import moment from 'moment'
import { citizenDocumentShareService } from '@/components/api/user/CitizenDocumentShareService'
import { useVuelidate } from '@vuelidate/core'
import { required, helpers, minLength, maxLength, sameAs } from '@vuelidate/validators'
import { useI18n } from 'vue-i18n'
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedDocument: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'sent'])
const { t } = useI18n()
const { successAlert } = useAlert()
const userStore = useUserStore() as any

// Two weeks unless the sender says otherwise; never more than a year.
const DEFAULT_EXPIRY_DAYS = 14
const today = moment().format('YYYY-MM-DD')
const latestExpiry = moment().add(1, 'year').format('YYYY-MM-DD')

const languageOptions = computed(() => [
    { value: 'dk', label: t('citizens.documents.sendLink.languages.dk') },
    { value: 'en', label: t('citizens.documents.sendLink.languages.en') },
    { value: 'no', label: t('citizens.documents.sendLink.languages.no') },
    { value: 'sv', label: t('citizens.documents.sendLink.languages.sv') },
])

function emptyForm() {
    return {
        emails: [] as string[],
        password: '',
        password_confirmation: '',
        expires_at: moment().add(DEFAULT_EXPIRY_DAYS, 'days').format('YYYY-MM-DD'),
        message: '',
        language: ['dk', 'en', 'no', 'sv'].includes(userStore.getLanguage) ? userStore.getLanguage : 'dk',
    }
}

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    form: emptyForm(),
})

const rules = computed(() => ({
    form: {
        emails: {
            required: helpers.withMessage(() => `${t('citizens.documents.sendLink.alert.recipientRequired')}.`, required),
            maxLength: helpers.withMessage(() => `${t('citizens.documents.sendLink.alert.tooManyRecipients')}.`, maxLength(10)),
        },
        password: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            minLength: helpers.withMessage(() => `${t('citizens.documents.sendLink.alert.passwordMin')}.`, minLength(8)),
        },
        password_confirmation: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            sameAsPassword: helpers.withMessage(() => `${t('citizens.documents.sendLink.alert.passwordMismatch')}.`, sameAs(state.form.password)),
        },
        expires_at: {
            required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            inRange: helpers.withMessage(() => `${t('citizens.documents.sendLink.alert.expiryRange')}.`,
                (value: string) => !value || (value >= today && value <= latestExpiry)),
        },
    },
}))

const v$ = useVuelidate(rules, state)

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) {
        state.error = {}
        state.form = emptyForm()
        v$.value.$reset()
    }
})

function closeModal() {
    emit('close')
}

// The server answers per address ("emails.1"), the form shows one line.
function firstServerError(field: string) {
    const errors = state.error?.errors as Record<string, string[]> | undefined
    if (!errors) {
        return undefined
    }
    const key = Object.keys(errors).find((name) => name === field || name.startsWith(`${field}.`))

    return key ? errors[key]?.[0] : undefined
}

async function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (v$.value.$error) {
        return
    }

    state.isPageLoading = true
    try {
        const response = await citizenDocumentShareService.sendShareLink({
            citizen_file_folder_uuid: props.selectedDocument?.uuid,
            emails: state.form.emails,
            password: state.form.password,
            password_confirmation: state.form.password_confirmation,
            expires_at: state.form.expires_at,
            message: state.form.message || null,
            language: state.form.language,
        })
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, `${t('citizens.documents.sendLink.sent')}.`)
            emit('sent', response.data)
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
