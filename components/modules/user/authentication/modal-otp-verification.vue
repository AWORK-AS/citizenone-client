<template>
    <div>
        <Modal size="xs" :title="$t('otpVerification.form.verifyCode')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="submitForm()">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="space-y-3">
                            <Alert type="default" :text="$t('otpVerification.checkYourEmailForOtp')" />
                            <div class="space-y-1">
                                <FormLabel for="otp" :label="$t('otpVerification.form.otp')" />
                                <FormTextField id="otp" name="otp" :placeholder="$t('otpVerification.form.otp')"
                                    v-model="state.formOtp.otp" />
                                <FormError :error="v$?.formOtp?.otp?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.otp?.[0]" />
                            </div>
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" @click="closeModal">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary">
                                    {{ $t('otpVerification.form.verify') }}
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
import { authService } from "@/components/api/user/AuthService"
import { useI18n } from "vue-i18n"
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useDepartmentStore } from '@/store/department'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const { t } = useI18n()
const departmentStore = useDepartmentStore()
const userStore = useUserStore()
const language = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    otpType: {
        type: String as () => 'ip' | 'device',
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    deviceUuid: {
        type: String,
        default: '',
    },
})
const emit = defineEmits(['close'])

const state = reactive({
    error: {} as Error,
    formOtp: {
        otp: '',
    },
    isPageLoading: false,
})

const rules = computed(() => {
    return {
        formOtp: {
            otp: {
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
        verifyOtp()
    }
}

async function verifyOtp() {
    state.error = {}
    state.isPageLoading = true
    try {
        let response: any
        if (props.otpType === 'ip') {
            response = await authService.verifyIpOtp({
                email: props.email,
                otp: state.formOtp.otp,
            })
        } else {
            response = await authService.verifyDeviceOtp({
                email: props.email,
                otp: state.formOtp.otp,
                device_uuid: props.deviceUuid,
                platform: 'web',
                user_agent: navigator.userAgent,
            })
        }
        if (response.data) {
            localStorage.setItem("_token", response.data?.token)
            departmentStore.resetSelectedDepartmentName()
            userStore.setUser(response?.data?.user)
            userStore.setLanguage(response?.data?.user?.language?.code)
            language.locale.value = response?.data?.user?.language?.code
            if (response.data.user?.role === 'Citizen') {
                navigateTo('/citizen/overview')
            } else if (response.data.user?.role === 'Relative') {
                navigateTo('/relative/citizens')
            } else {
                navigateTo('/overview')
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
