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
                                <FormLabel for="content" :label="$t('mail.secured.form.message')" />
                                <FormTextArea id="content" name="content" :placeholder="$t('mail.secured.form.message')"
                                    v-model="state.formSecuredMail.content" />
                                <FormError :error="v$?.formSecuredMail?.content?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.content?.[0]" />
                            </div>
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="closeModal()">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary" class="rounded-md">
                                    {{ props.formType === 'create' ? $t('save') :
                                        $t('mail.secured.form.send') }}
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
    isPageLoading: false,
})

const rules = computed(() => {
    return {
        formSecuredMail: {
            message: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
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
            const params = {
                token: emailUuid,
                email: email,
                message: state.formSecuredMail.message,
            }
            const response = await securedMailService.saveReply(params)
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