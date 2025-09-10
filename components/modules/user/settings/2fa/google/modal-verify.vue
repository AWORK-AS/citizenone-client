<template>
    <div>
        <Modal size="xs" :title="$t('2fa.form.verifyCode')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="submitForm()">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="space-y-1 w-1/3 mx-auto" v-if="!props.google2fa?.is_google_2fa_enabled">
                            <QRCodeVue3 :value="state.qrCodeUrl" :width="800" :height="800" image="/img/logo.svg"
                                :qrOptions="{ typeNumber: 0, mode: 'Byte', errorCorrectionLevel: 'H' }"
                                :imageOptions="{ hideBackgroundDots: true, imageSize: 10, margin: 2 }"
                                :dotsOptions="{ type: 'classy', color: '#205E77' }"
                                :cornersSquareOptions="{ type: 'extra-rounded', color: '#41ADD8' }"
                                :cornersDotOptions="{ type: 'square', color: '#205E77' }"
                                :key="state.qrCodeComponentKey" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="code" :label="$t('2fa.form.code')" />
                            <FormTextField id="code" name="code" :placeholder="$t('2fa.form.code')"
                                v-model="state.form2fa.code" />
                            <FormError :error="v$?.form2fa?.code?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.code?.[0]" />
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="closeModal">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary" class="rounded-md">
                                    {{ $t('2fa.form.verify') }}
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
import { google2FAService } from "@/components/api/user/Google2FAService"
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()
const QRCodeVue3 = defineAsyncComponent(() =>
    import('qrcode-vue3')
)

const props = defineProps({
    google2fa: {
        type: Object,
        required: false,
    },
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close', 'setGoogle2faStatus'])

const state = reactive({
    error: {} as Error,
    form2fa: {
        code: '',
    },
    isPageLoading: false,
    qrCodeComponentKey: 0,
    qrCodeUrl: '',
})

const rules = computed(() => {
    return {
        form2fa: {
            code: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen && !props.google2fa?.is_google_2fa_enabled) {
        fetchGoogle2faQR()
    }
})

function closeModal() {
    emit('close')
}

async function fetchGoogle2faQR() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await google2FAService.generateQR()
        if (response.data?.qr_code) {
            state.qrCodeUrl = response.data?.qr_code
            state.qrCodeComponentKey += 1
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function submitForm() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        verifyCode()
    }
}

async function verifyCode() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            code: state.form2fa.code,
        }
        const response = await google2FAService.verifyCode(params)
        if (response.data) {
            if (response.data?.is_google_2fa_enabled) {
                successAlert(`${t('alert.success')}!`, `${t('2fa.alert.google2FASuccessfullyEnabled')}.`)
                emit('setGoogle2faStatus', true)
            } else {
                successAlert(`${t('alert.success')}!`, `${t('2fa.alert.google2FASuccessfullyEnabled')}.`)
                emit('setGoogle2faStatus', false)
            }
            state.form2fa.code = ''
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>