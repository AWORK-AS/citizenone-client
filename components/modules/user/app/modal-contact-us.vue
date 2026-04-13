<template>
    <div>
        <Modal size="xs" :title="`${$t('apps.contactUs')}`" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="sendMessage()">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="gap-y-3">
                            <div class="space-y-1">
                                <FormLabel for="message" :label="`${$t('apps.form.sendUsAMessage')}.`" />
                                <FormTextArea id="message" name="message"
                                    :placeholder="`${$t('apps.form.pleaseWriteHere')}...`"
                                    v-model="state.formContactUs.message" />
                                <FormError
                                    :error="vContactUsStorage$?.formContactUs?.message?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.message?.[0]" />
                            </div>
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" @click="closeModal">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary" class="w-full">
                                    {{ $t('apps.form.sendMessage') }}
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
import { contactUsService } from '@/components/api/user/ContactUsService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { successAlert } = useAlert()
const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedApp: {
        type: Object,
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
                app_uuid: props.selectedApp?.uuid,
                message: state.formContactUs.message,
            }
            const response = await contactUsService.sendAppMessage(params)
            if (response) {
                closeModal()
                successAlert(`${t('alert.success')}!`, `${t('apps.alert.messageSuccessfullySent')}.`)
            }
        } catch (error: any) {
            state.error = error
        }
    }
    state.isPageLoading = false
}
</script>