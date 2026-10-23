<template>
    <div v-if="variant && granted" role="status" class="mb-4 flex items-start gap-3 rounded-lg border bg-white px-4 py-3"
        :class="urgent ? 'border-[#2dbab2]' : 'border-gray-200'">
        <ModulesUserNavbarCodyMark :size="22" class="mt-0.5 shrink-0" />

        <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-primary">{{ title }}</p>
            <p v-if="body" class="mt-0.5 text-sm text-gray-600">{{ body }}</p>

            <div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                <FormButton v-if="variant === 'adminTrial'" type="button" buttonStyle="primary" buttonSize="xs"
                    @click="navigateTo(appPath)">
                    {{ $t('cody.adoption.tryFree') }}
                </FormButton>
                <FormButton v-else-if="variant === 'adminEnable'" type="button" buttonStyle="primary" buttonSize="xs"
                    @click="navigateTo(appPath)">
                    {{ $t('cody.adoption.turnOn') }}
                </FormButton>
                <FormButton v-else-if="variant === 'request' && requestState !== 'sent' && requestState !== 'recent'"
                    type="button" buttonStyle="primary" buttonSize="xs" :disabled="requestState === 'sending'"
                    @click="requestFromAdmin()">
                    {{ $t('cody.adoption.askAdmin') }}
                </FormButton>
                <span v-else-if="variant === 'request'" class="text-sm font-medium text-primary">
                    <Icon name="ph:check-circle" class="mr-1 inline h-4 w-4 text-[#2dbab2]" aria-hidden="true" />
                    {{ $t('cody.adoption.sent') }}
                </span>

                <button v-if="variant === 'trial' && isAdmin" type="button"
                    class="text-sm font-semibold text-primary underline underline-offset-2" @click="navigateTo(appPath)">
                    {{ $t('cody.adoption.buy') }}
                </button>

                <p v-if="requestState === 'no_admin'" class="text-sm text-gray-600">{{ $t('cody.adoption.noAdmin') }}</p>
                <p v-if="requestState === 'error'" class="text-sm text-red-600">{{ $t('cody.adoption.requestFailed') }}</p>
            </div>
        </div>

        <button type="button" class="shrink-0 text-gray-500 hover:text-gray-900 transition-colors"
            :aria-label="$t('close')" @click="dismiss(variant === 'trial' ? 'trial' : 'banner')">
            <Icon name="ph:x" class="h-4 w-4" aria-hidden="true" />
        </button>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { formatPrice } from '@/composables/customerSpecialPrice'

const { t } = useI18n()
const {
    status, isAdmin, hasAccess, requestState, appPath,
    load, requestFromAdmin, isDismissed, dismiss,
} = useCodyAdoption()

const daysLeft = computed(() => Math.max(0, Number(status.value?.trial?.days_left ?? 0)))
// From three days left the countdown stops being a footnote.
const urgent = computed(() => variant.value === 'trial' && daysLeft.value <= 3)

const showUpgrade = useCanPurchase()

const variant = computed<'trial' | 'adminTrial' | 'adminEnable' | 'request' | null>(() => {
    const s = status.value
    if (!s) return null
    // An offer to buy is for someone who can buy. Staff who cannot see nothing.
    if (!showUpgrade.value) return null
    if (s.trial?.active) return isDismissed('trial') ? null : 'trial'
    if (hasAccess.value || s.has_access || s.company_has_cody) return null
    if (isDismissed('banner')) return null
    if (s.can_manage) return s.trial?.available ? 'adminTrial' : 'adminEnable'
    return 'request'
})

// One unsolicited prompt at a time: the banner waits for the tour and the security prompts.
const granted = usePromptSlot('codyBanner', computed(() => variant.value !== null))

const title = computed(() => {
    switch (variant.value) {
        case 'trial': {
            const base = t('cody.adoption.trialLeft', { count: daysLeft.value }, daysLeft.value)
            const amount = formatPrice(status.value?.trial?.amount_gross)
            return amount ? `${base}. ${t('cody.adoption.thenAmount', { amount })}` : base
        }
        case 'adminTrial': return t('cody.adoption.headline')
        case 'adminEnable': return t('cody.adoption.enableTitle')
        case 'request': return t('cody.adoption.requestTitle')
        default: return ''
    }
})

const body = computed(() => {
    switch (variant.value) {
        case 'adminTrial': return t('cody.adoption.headlineBody')
        case 'adminEnable': return t('cody.adoption.headlineBody')
        case 'request': return t('cody.adoption.requestBody')
        default: return ''
    }
})

onMounted(() => load())
</script>
