<template>
    <div>
        <Modal size="md" :title="$t('mail.secured.replySecurely')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <form @submit.prevent="saveReply()">
                        <div class="space-y-1">
                            <div class="space-y-1">
                                <FormLabel for="message" :label="$t('mail.secured.form.message')" />
                                <FormTextArea id="message" name="message" :placeholder="$t('mail.secured.form.message')"
                                    v-model="state.formSecuredMail.message" />
                                <FormError :error="v$?.formSecuredMail?.message?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.message?.[0]" />
                            </div>
                            <div class="space-y-1 mt-3">
                                <div v-if="state.selectedFiles.length" class="flex flex-wrap gap-2">
                                    <div v-for="(file, i) in state.selectedFiles" :key="i"
                                        class="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-700">
                                        <Icon name="ph:file" class="w-3.5 h-3.5 text-gray-500" />
                                        <span class="max-w-[160px] truncate">{{ file.name }}</span>
                                        <button type="button" class="text-gray-400 hover:text-red-500 transition"
                                            :aria-label="$t('mail.secured.form.removeFile')" @click="removeFile(i)">
                                            <Icon name="ph:x" class="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                                <input ref="fileInput" type="file" multiple class="hidden" @change="handleFileChange" />
                                <FormButton type="button" buttonStyle="cancel" @click="triggerFileInput">
                                    {{ $t('mail.secured.form.attachFile') }}
                                </FormButton>
                                <FormError :error="state?.error?.errors?.['file']?.[0]" />
                            </div>
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" @click="closeModal()">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary">
                                    {{ $t('mail.secured.form.send') }}
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
import { securedMailService } from '@/components/api/user/SecuredMailService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const emailUuid = router?.currentRoute?.value?.query?.token
const email = router?.currentRoute?.value?.query?.email

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close'])

const state = reactive({
    error: {} as Error,
    formSecuredMail: {
        message: '',
    },
    selectedFiles: [] as File[],
    isPageLoading: false,
})

const fileInput = ref<HTMLInputElement | null>(null)

function triggerFileInput() {
    fileInput.value?.click()
}

function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement
    if (target.files) {
        state.selectedFiles = [...state.selectedFiles, ...Array.from(target.files)]
    }
    if (fileInput.value) fileInput.value.value = ''
}

function removeFile(index: number) {
    state.selectedFiles.splice(index, 1)
}

const rules = computed(() => {
    return {
        formSecuredMail: {
            message: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function closeModal() {
    emit('close')
}

async function saveReply() {
    if (!v$.value.$error) {
        state.error = {}
        state.isPageLoading = true
        try {
            let response
            if (state.selectedFiles.length) {
                const formData = new FormData()
                formData.append('token', String(emailUuid ?? ''))
                formData.append('email', String(email ?? ''))
                formData.append('message', state.formSecuredMail.message)
                state.selectedFiles.forEach((file) => formData.append('file[]', file))
                response = await securedMailService.saveReplyWithFiles(formData)
            } else {
                const params = {
                    token: emailUuid,
                    email: email,
                    message: state.formSecuredMail.message,
                }
                response = await securedMailService.saveReply(params)
            }
            if (response.data) {
                successAlert(`${t('alert.success')}!`, `${t('mail.secured.form.alert.securedMailSuccessfullySent')}.`)
                closeModal()
            }
        } catch (error: any) {
            state.error = error
        }
        state.isPageLoading = false
    }
}
</script>