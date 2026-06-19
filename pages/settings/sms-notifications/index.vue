<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('sms.settings.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>{{ $t('sms.settings.title') }}</template>
            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <div>
                <ModulesUserSettingsTab />

                <div id="sms-checkout"></div>

                <div v-if="!state.isCheckoutVisible" class="mt-6 space-y-4">
                    <Alert type="danger" :text="state.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <!-- SMS Enable + Balance card -->
                    <LoadingSpinner :isActive="state.isPageLoading">
                        <div class="bg-white border border-[#EAECF0] rounded-xl p-6 shadow-sm max-w-2xl">
                            <div class="flex items-center justify-between mb-5">
                                <div>
                                    <h2 class="text-[16px] font-semibold text-[#1F2533]">
                                        {{ $t('sms.settings.enableSms') }}
                                    </h2>
                                    <p class="text-sm text-[#5C6478] mt-1">
                                        {{ $t('sms.settings.enableSmsHint') }}
                                    </p>
                                </div>
                                <div class="flex items-center gap-3 shrink-0">
                                    <span class="text-sm font-medium text-[#205E77] bg-[#E4F1F6] px-3 py-1 rounded-full">
                                        {{ $t('sms.settings.balance') }}: {{ formatBalance(state.settings.sms_balance) }}
                                    </span>
                                    <button type="button"
                                        class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none"
                                        :class="state.settings.sms_enabled ? 'bg-[#205E77]' : 'bg-[#D1D5DB]'"
                                        @click="state.settings.sms_enabled = !state.settings.sms_enabled">
                                        <span
                                            class="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"
                                            :class="state.settings.sms_enabled ? 'translate-x-4' : 'translate-x-1'" />
                                    </button>
                                </div>
                            </div>

                            <div v-if="state.settings.sms_enabled" class="space-y-3 border-t border-[#EAECF0] pt-4">
                                <p class="text-[13px] font-semibold text-[#1F2533]">
                                    {{ $t('sms.settings.notificationEvents') }}
                                </p>
                                <div class="flex items-center justify-between py-2">
                                    <p class="text-[14px] text-[#1F2533]">{{ $t('sms.settings.notifyNewAppointment') }}</p>
                                    <button type="button"
                                        class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none"
                                        :class="state.settings.notify_new_appointment ? 'bg-[#205E77]' : 'bg-[#D1D5DB]'"
                                        @click="state.settings.notify_new_appointment = !state.settings.notify_new_appointment">
                                        <span
                                            class="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"
                                            :class="state.settings.notify_new_appointment ? 'translate-x-4' : 'translate-x-1'" />
                                    </button>
                                </div>
                                <div class="flex items-center justify-between py-2 border-t border-[#EAECF0]">
                                    <p class="text-[14px] text-[#1F2533]">{{ $t('sms.settings.notifyReminder24h') }}</p>
                                    <button type="button"
                                        class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none"
                                        :class="state.settings.notify_reminder_24h ? 'bg-[#205E77]' : 'bg-[#D1D5DB]'"
                                        @click="state.settings.notify_reminder_24h = !state.settings.notify_reminder_24h">
                                        <span
                                            class="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"
                                            :class="state.settings.notify_reminder_24h ? 'translate-x-4' : 'translate-x-1'" />
                                    </button>
                                </div>
                                <div class="flex items-center justify-between py-2 border-t border-[#EAECF0]">
                                    <p class="text-[14px] text-[#1F2533]">
                                        {{ $t('sms.settings.notifyReminderSameDay') }}
                                    </p>
                                    <button type="button"
                                        class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none"
                                        :class="state.settings.notify_reminder_same_day ? 'bg-[#205E77]' : 'bg-[#D1D5DB]'"
                                        @click="state.settings.notify_reminder_same_day = !state.settings.notify_reminder_same_day">
                                        <span
                                            class="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"
                                            :class="state.settings.notify_reminder_same_day ? 'translate-x-4' : 'translate-x-1'" />
                                    </button>
                                </div>
                            </div>

                            <div class="flex justify-end mt-6 pt-4 border-t border-[#EAECF0]">
                                <FormButton buttonStyle="primary" @click="saveSettings" :disabled="state.isSaving">
                                    <Icon v-if="state.isSaving" name="ph:spinner" class="w-4 h-4 animate-spin" />
                                    {{ state.isSaving ? $t('saving') : $t('save') }}
                                </FormButton>
                            </div>
                        </div>

                        <!-- Azure Communication Services card -->
                        <div class="mt-4 bg-white border border-[#EAECF0] rounded-xl p-6 shadow-sm max-w-2xl">
                            <div class="mb-2">
                                <h2 class="text-[16px] font-semibold text-[#1F2533]">
                                    {{ $t('sms.settings.azureTitle') }}
                                </h2>
                            </div>
                            <p class="text-sm text-[#5C6478]">
                                {{ $t('sms.settings.azureDesc') }}
                            </p>
                        </div>

                        <!-- Auto-recharge card -->
                        <div class="mt-4 bg-white border border-[#EAECF0] rounded-xl p-6 shadow-sm max-w-2xl">
                            <div class="flex items-center justify-between mb-2">
                                <div>
                                    <h2 class="text-[16px] font-semibold text-[#1F2533]">
                                        {{ $t('sms.settings.autoRecharge') }}
                                    </h2>
                                    <p class="text-sm text-[#5C6478] mt-1">
                                        {{ $t('sms.settings.autoRechargeHint') }}
                                    </p>
                                </div>
                                <button type="button"
                                    class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none"
                                    :class="state.settings.auto_recharge_enabled ? 'bg-[#205E77]' : 'bg-[#D1D5DB]'"
                                    @click="state.settings.auto_recharge_enabled = !state.settings.auto_recharge_enabled">
                                    <span
                                        class="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"
                                        :class="state.settings.auto_recharge_enabled ? 'translate-x-4' : 'translate-x-1'" />
                                </button>
                            </div>

                            <div v-if="state.settings.auto_recharge_enabled" class="mt-4 space-y-4">
                                <div class="space-y-1">
                                    <FormLabel :label="$t('sms.settings.autoRechargeThreshold')" />
                                    <div class="flex items-center gap-2 max-w-xs">
                                        <FormNumberField name="auto_recharge_threshold"
                                            :placeholder="$t('sms.settings.autoRechargeThreshold')"
                                            v-model="state.settings.auto_recharge_threshold" :min="1"
                                            :max="1000" class="flex-1" />
                                        <span class="text-sm text-[#5C6478]">DKK</span>
                                    </div>
                                </div>
                                <div class="space-y-1">
                                    <FormLabel :label="$t('sms.settings.autoRechargeAmount')" />
                                    <div class="flex items-center gap-2 max-w-xs">
                                        <FormNumberField name="auto_recharge_amount"
                                            :placeholder="$t('sms.settings.autoRechargeAmount')"
                                            v-model="state.settings.auto_recharge_amount" :min="50"
                                            :max="10000" class="flex-1" />
                                        <span class="text-sm text-[#5C6478]">DKK</span>
                                    </div>
                                </div>
                            </div>

                            <div class="flex justify-end mt-6 pt-4 border-t border-[#EAECF0]">
                                <FormButton buttonStyle="primary" @click="saveSettings" :disabled="state.isSaving">
                                    <Icon v-if="state.isSaving" name="ph:spinner" class="w-4 h-4 animate-spin" />
                                    {{ state.isSaving ? $t('saving') : $t('save') }}
                                </FormButton>
                            </div>
                        </div>

                        <!-- Buy credits card -->
                        <div class="mt-4 bg-white border border-[#EAECF0] rounded-xl p-6 shadow-sm max-w-2xl">
                            <h2 class="text-[16px] font-semibold text-[#1F2533] mb-1">
                                {{ $t('sms.credits.title') }}
                            </h2>
                            <p class="text-sm text-[#5C6478] mb-4">
                                {{ $t('sms.credits.desc') }}
                            </p>

                            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                <button v-for="preset in creditPresets" :key="preset"
                                    class="py-3 rounded-xl border-2 text-[13px] font-semibold transition-colors"
                                    :style="state.creditAmount === preset && !state.customCredit
                                        ? 'border-color:#205E77;background:#E4F1F6;color:#205E77'
                                        : 'border-color:#EAECF0;background:white;color:#5C6478'"
                                    @click="selectPreset(preset)">
                                    {{ preset }} DKK
                                </button>
                            </div>

                            <div class="space-y-1 mb-1">
                                <FormLabel :label="$t('sms.credits.customAmount')" />
                                <div class="flex items-center gap-2 max-w-xs">
                                    <FormNumberField name="credit_amount" v-model="state.customAmountInput"
                                        :min="50" :max="10000"
                                        :placeholder="$t('sms.credits.customAmountPlaceholder')"
                                        @update:modelValue="onCustomAmountChange" class="flex-1" />
                                    <span class="text-sm text-[#5C6478]">DKK</span>
                                </div>
                                <p v-if="state.creditAmountError" class="text-xs text-red-500">
                                    {{ state.creditAmountError }}
                                </p>
                            </div>

                            <p class="text-[11px] text-[#8891A4] mb-4">
                                {{ $t('sms.credits.pricingNote') }}
                            </p>

                            <FormButton buttonStyle="primary" @click="purchaseCredits"
                                :disabled="state.isPurchasing || !!state.creditAmountError">
                                <Icon v-if="state.isPurchasing" name="ph:spinner" class="w-4 h-4 animate-spin" />
                                {{ state.isPurchasing ? $t('sms.credits.processing') : $t('sms.credits.buyButton') }}
                            </FormButton>
                        </div>
                    </LoadingSpinner>
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { smsService } from '@/components/api/user/SmsService'
import { appService } from '@/components/api/user/AppService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()

const breadcrumbLinks = [
    { name: 'sms.settings.title', translate: true, href: '/settings/sms-notifications' },
]

const creditPresets = [100, 250, 500]

let checkout = null as any
let smsAppUuid: string | null = null

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    isSaving: false,
    isPurchasing: false,
    isCheckoutVisible: false,
    settings: {
        sms_enabled: false,
        notify_new_appointment: false,
        notify_reminder_24h: false,
        notify_reminder_same_day: false,
        sms_balance: 0,
        auto_recharge_enabled: false,
        auto_recharge_threshold: 10,
        auto_recharge_amount: 100,
    },
    creditAmount: 100 as number | null,
    customCredit: false,
    customAmountInput: null as number | null,
    creditAmountError: '',
})

function formatBalance(amount: number): string {
    return `${(amount ?? 0).toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DKK`
}

function selectPreset(amount: number) {
    state.creditAmount = amount
    state.customCredit = false
    state.customAmountInput = null
    state.creditAmountError = ''
}

function onCustomAmountChange(val: any) {
    const num = Number(val)
    if (!val) {
        state.creditAmount = null
        state.customCredit = false
        state.creditAmountError = ''
        return
    }
    state.customCredit = true
    state.creditAmount = num
    if (num < 50 || num > 10000) {
        state.creditAmountError = t('sms.credits.amountError')
    } else {
        state.creditAmountError = ''
    }
}

onMounted(async () => {
    const paymentId = router.currentRoute.value.query.paymentId as string | undefined
    if (paymentId) {
        await verifyPayment(paymentId)
        router.replace({ query: {} })
    }
    await fetchSettings()
    fetchSmsAppUuid()
})

async function fetchSettings() {
    state.isPageLoading = true
    state.error = {} as Error
    try {
        const response = await smsService.getSettings()
        if (response?.data) {
            const d = response.data
            state.settings.sms_enabled = d.sms_enabled ?? false
            state.settings.notify_new_appointment = d.notify_new_appointment ?? false
            state.settings.notify_reminder_24h = d.notify_reminder_24h ?? false
            state.settings.notify_reminder_same_day = d.notify_reminder_same_day ?? false
            state.settings.sms_balance = d.sms_balance ?? 0
            state.settings.auto_recharge_enabled = d.auto_recharge_enabled ?? false
            state.settings.auto_recharge_threshold = d.auto_recharge_threshold ?? 10
            state.settings.auto_recharge_amount = d.auto_recharge_amount ?? 100
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchSmsAppUuid() {
    if (smsAppUuid) return
    try {
        const response = await appService.getApps({ type: 'citizenone' })
        const apps = response?.data ?? response ?? []
        const list = Array.isArray(apps) ? apps : apps?.data ?? []
        const app = list.find((a: any) => a.generic_name === 'sms-notification')
        if (app?.uuid) smsAppUuid = app.uuid
    } catch { /* ignore */ }
}

async function saveSettings() {
    state.isSaving = true
    state.error = {} as Error
    try {
        await smsService.updateSettings({
            sms_enabled: state.settings.sms_enabled,
            notify_new_appointment: state.settings.notify_new_appointment,
            notify_reminder_24h: state.settings.notify_reminder_24h,
            notify_reminder_same_day: state.settings.notify_reminder_same_day,
            auto_recharge_enabled: state.settings.auto_recharge_enabled,
            ...(state.settings.auto_recharge_enabled ? {
                auto_recharge_threshold: state.settings.auto_recharge_threshold,
                auto_recharge_amount: state.settings.auto_recharge_amount,
            } : {}),
        })
        successAlert(`${t('alert.success')}!`, `${t('sms.settings.savedSuccess')}.`)
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}

async function purchaseCredits() {
    if (!state.creditAmount || state.creditAmountError) return
    state.isPurchasing = true
    state.error = {} as Error
    try {
        if (!smsAppUuid) await fetchSmsAppUuid()
        if (!smsAppUuid) {
            state.error = { message: t('sms.credits.appNotFound') } as Error
            state.isPurchasing = false
            return
        }
        const response = await appService.activateApp(smsAppUuid as any, { amount: state.creditAmount })
        if (response) {
            const checkoutOptions = {
                checkoutKey: runtimeConfig?.public?.checkoutKey,
                paymentId: response?.paymentId,
                containerId: 'sms-checkout',
                language: 'da-DK',
                theme: { buttonRadius: '5px' },
            }
            checkout = new (window as any).Dibs.Checkout(checkoutOptions)
            checkout.on('payment-completed', (res: any) => {
                checkout.cleanup()
                navigateTo(`/settings/sms-notifications?paymentId=${res['paymentId']}`)
            })
            state.isCheckoutVisible = true
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPurchasing = false
}

async function verifyPayment(paymentId: string) {
    state.isPageLoading = true
    try {
        await appService.validatePurchase(paymentId)
        successAlert(`${t('alert.success')}!`, `${t('sms.credits.purchaseSuccess')}.`)
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
