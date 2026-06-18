<template>
    <div>
        <Modal size="xs" :title="$t('2fa.form.verifyCode')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="submitForm()">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="space-y-3">
                            <Alert type="default"
                                :text="$t('2fa.useYour2faCodeFromGoogleAuthenticatorAppOnYourPhone')" />
                            <div class="space-y-1">
                                <FormLabel for="code" :label="$t('2fa.form.code')" />
                                <FormTextField id="code" name="code" :placeholder="$t('2fa.form.code')"
                                    v-model="state.form2fa.code" />
                                <FormError :error="v$?.form2fa?.code?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.code?.[0]" />
                            </div>
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" @click="closeModal">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary">
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
    formLogin: {
        type: Object,
        required: true,
    },
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close'])

const state = reactive({
    error: {} as Error,
    form2fa: {
        code: '',
    },
    isPageLoading: false,
})

const rules = computed(() => {
    return {
        form2fa: {
            code: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
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
        verifyCode()
    }
}

async function verifyCode() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            code: state.form2fa.code,
            email: props.formLogin.email,
            password: props.formLogin.password,
        }
        const response = await authService.verify2faCode(params)
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