<template>
    <div>
        <Modal size="xs" :title="`${$t('storage.form.howMuchStorageDoYouNeed')}?`" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="sendMessage()">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="gap-y-3">
                            <div class="space-y-1">
                                <FormLabel for="message" :label="`${$t('storage.form.tellUsHowMuchStorage')}.`" />
                                <FormTextArea id="message" name="message"
                                    :placeholder="`${$t('storage.form.pleaseWriteHere')}...`"
                                    v-model="state.formContactUs.message" />
                                <FormError
                                    :error="vContactUsStorage$?.formContactUs?.message?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.title?.[0]" />
                            </div>
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="closeModal">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full">
                                    {{ $t('storage.form.sendMessage') }}
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
import { contactUsService } from '@/components/api/ContactUsService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import { notify } from "@kyvg/vue3-notification"
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})

const { t } = useI18n()
const emit = defineEmits(['close'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formContactUs: {
        message: '',
    },
})

function closeModal() {
    emit('close')
}

const rulesContactUsStorage = computed(() => {
    return {
        formContactUs: {
            // message: {
            //     required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            // },
        },
    }
})

const vContactUsStorage$ = useVuelidate(rulesContactUsStorage, state)

async function sendMessage() {
    state.isPageLoading = true
    state.error = {}
    vContactUsStorage$.value.$validate()
    if (!vContactUsStorage$.value.$error) {
        try {
            const params = {
                message: state.formContactUs.message,
            }
            const response = await contactUsService.sendStorageUpgradeMessage(params)
            if (response) {
                closeModal()
                successAlert(`${t('alert.success')}!`, `${t('storage.alert.messageSuccessfullySent')}.`)
            }
        } catch (error: any) {
            state.error = error
        }
    }
    state.isPageLoading = false
}

function successAlert(title: string, message: string) {
    notify({
        title: title,
        text: message,
        type: 'success',
    })
}
</script>