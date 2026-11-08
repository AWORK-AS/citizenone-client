<template>
    <!-- Not closable: the API refuses everything else until 2FA is on. The ways out are setup or logout. -->
    <Modal size="sm" :title="$t('superadmin.twoFactor.setupTitle')" :show="props.isModalOpen" @close="() => {}">
        <template #modal-body>
            <LoadingSpinner :isActive="state.isLoading">
                <div class="space-y-5">
                    <div class="flex items-start gap-3 rounded-xl border border-[#e2e8f0] bg-[#f0faf9] p-4">
                        <Icon name="ph:shield-check" class="w-6 h-6 shrink-0 text-[#2dbab2]" />
                        <p class="text-sm text-[#1a2332]">{{ $t('superadmin.twoFactor.setupIntro') }}</p>
                    </div>

                    <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />

                    <ol class="space-y-5">
                        <li class="flex gap-3">
                            <span class="co-step">1</span>
                            <p class="text-sm text-[#1a2332] pt-0.5">{{ $t('superadmin.twoFactor.step1') }}</p>
                        </li>
                        <li class="flex gap-3">
                            <span class="co-step">2</span>
                            <div class="flex-1 space-y-3">
                                <p class="text-sm text-[#1a2332] pt-0.5">{{ $t('superadmin.twoFactor.step2') }}</p>
                                <div v-if="state.otpauthUrl"
                                    class="mx-auto w-44 rounded-xl border border-[#e2e8f0] bg-white p-2">
                                    <QRCodeVue3 :value="state.otpauthUrl" :width="400" :height="400"
                                        :qrOptions="{ typeNumber: 0, mode: 'Byte', errorCorrectionLevel: 'M' }"
                                        :dotsOptions="{ type: 'square', color: '#0f2b46' }"
                                        :cornersSquareOptions="{ type: 'extra-rounded', color: '#0f4c75' }"
                                        :cornersDotOptions="{ type: 'square', color: '#0f2b46' }"
                                        :key="state.otpauthUrl" />
                                </div>
                                <div v-if="state.secret" class="space-y-1">
                                    <p class="text-xs text-[#64748b]">{{ $t('superadmin.twoFactor.manualKey') }}</p>
                                    <div class="flex items-stretch gap-2">
                                        <code
                                            class="flex-1 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2 font-mono text-[13px] text-[#1a2332] break-all select-all">{{ formatSecret(state.secret) }}</code>
                                        <button type="button" @click="copySecret"
                                            class="rounded-lg border border-[#2dbab2] bg-[#f0faf9] px-3 text-xs font-semibold text-[#0f4c75] hover:bg-[#e1f5f3] transition-colors">
                                            {{ state.copied ? $t('superadmin.twoFactor.copied') : $t('superadmin.twoFactor.copy') }}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </li>
                        <li class="flex gap-3">
                            <span class="co-step">3</span>
                            <form class="flex-1 space-y-3" @submit.prevent="confirm">
                                <label for="staff-2fa-setup-code" class="block text-sm text-[#1a2332] pt-0.5">
                                    {{ $t('superadmin.twoFactor.step3') }}
                                </label>
                                <ModulesSuperadminTwoFactorCodeInput id="staff-2fa-setup-code" v-model="state.code"
                                    :label="$t('superadmin.twoFactor.codeLabel')" @submit="confirm" />
                            </form>
                        </li>
                    </ol>

                    <div class="flex gap-3 pt-1">
                        <button type="button" @click="emit('logout')"
                            class="flex-1 rounded-lg border border-[#e2e8f0] bg-white py-2.5 text-xs font-semibold text-[#64748b] hover:bg-[#f8fafc] transition-colors">
                            {{ $t('superadmin.twoFactor.logout') }}
                        </button>
                        <button type="button" @click="confirm" :disabled="!isCompleteTotpCode(state.code) || state.isLoading"
                            class="flex-1 rounded-lg bg-[#2dbab2] py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#27a39c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            {{ $t('superadmin.twoFactor.confirm') }}
                        </button>
                    </div>
                </div>
            </LoadingSpinner>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { userService } from '@/components/api/superadmin/UserService'
import { formatSecret, isCompleteTotpCode, secretFromOtpauthUrl } from '@/composables/staffTwoFactor'
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'

const QRCodeVue3 = defineAsyncComponent(() => import('qrcode-vue3'))

const props = defineProps({
    isModalOpen: { type: Boolean, required: true },
})
const emit = defineEmits(['enabled', 'logout'])

const { successAlert } = useAlert()
const { t } = useI18n()
const userStore = useUserStore() as any

const state = reactive({
    code: '',
    copied: false,
    error: {} as any,
    isLoading: false,
    otpauthUrl: '',
    secret: '',
})

watch(() => props.isModalOpen, (open) => {
    if (open) loadSetup()
}, { immediate: true })

async function loadSetup() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await userService.getTwoFactorSetup()
        state.otpauthUrl = response?.data?.otpauth_url ?? ''
        state.secret = response?.data?.secret || secretFromOtpauthUrl(state.otpauthUrl)
    } catch (error: any) {
        // Already on (set up in another tab): nothing left to do here.
        if (error?.code === 'two_factor_already_enabled') {
            emit('enabled')
        } else {
            state.error = error
        }
    }
    state.isLoading = false
}

async function confirm() {
    if (!isCompleteTotpCode(state.code) || state.isLoading) return
    state.error = {}
    state.isLoading = true
    try {
        const response = await userService.confirmTwoFactor({ code: state.code })
        if (response?.data?.is_google_2fa_enabled) {
            userStore.setUser({ ...userStore.getUser, is_google_2fa_enabled: true })
            successAlert(`${t('alert.success')}!`, t('superadmin.twoFactor.enabled'))
            emit('enabled')
        }
    } catch (error: any) {
        state.error = error
        state.code = ''
    }
    state.isLoading = false
}

async function copySecret() {
    try {
        await navigator.clipboard.writeText(state.secret)
        state.copied = true
        setTimeout(() => { state.copied = false }, 2000)
    } catch {
        // Clipboard blocked: the key is selectable on its own.
    }
}
</script>

<style scoped>
.co-step {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    border-radius: 9999px;
    background: #0f4c75;
    color: #fff;
    font-size: 12px;
    font-weight: 600;
}
</style>
