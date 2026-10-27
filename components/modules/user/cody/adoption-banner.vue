<template>
    <div v-if="variant && granted" role="status" class="mb-4 flex items-start gap-3 rounded-lg border bg-white px-4 py-3"
        :class="urgent ? 'border-ai' : 'border-gray-200'">
        <ModulesUserNavbarCodyMark :size="22" class="mt-0.5 shrink-0" />

        <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-ai-ink">{{ title }}</p>
            <p v-if="body" class="mt-0.5 text-sm text-gray-600">{{ body }}</p>
            <!-- Staff asking for Cody: a count, never names. -->
            <p v-if="demandText" class="mt-1 text-sm font-medium text-gray-800" data-testid="cody-banner-demand">{{ demandText }}</p>
            <p v-if="priceText" class="mt-1 text-xs text-gray-500" data-testid="cody-banner-price">{{ priceText }}</p>

            <div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                <FormButton v-if="variant === 'adminTrial'" type="button" buttonStyle="primary" buttonSize="xs" class="!bg-ai-ink !border-ai-ink hover:!bg-ai-ink/90 hover:!border-ai-ink"
                    @click="act('try_free', appPath)">
                    {{ $t('cody.adoption.tryFree', { days: trialDays(status?.trial?.days) }) }}
                </FormButton>
                <FormButton v-else-if="variant === 'adminEnable'" type="button" buttonStyle="primary" buttonSize="xs" class="!bg-ai-ink !border-ai-ink hover:!bg-ai-ink/90 hover:!border-ai-ink"
                    @click="act('buy', appPath)">
                    {{ $t('cody.adoption.turnOn') }}
                </FormButton>
                <!-- The company has Cody: the action is assigning seats, not buying. -->
                <FormButton v-else-if="variant === 'seats'" type="button" buttonStyle="primary" buttonSize="xs"
                    @click="act('click', SEATS_PATH)">
                    {{ $t('cody.adoption.seats.assign', { count: demand }, demand) }}
                </FormButton>
                <FormButton v-else-if="variant === 'request' && requestState !== 'sent' && requestState !== 'recent'"
                    type="button" buttonStyle="primary" buttonSize="xs" class="!bg-ai-ink !border-ai-ink hover:!bg-ai-ink/90 hover:!border-ai-ink" :disabled="requestState === 'sending'"
                    @click="requestFromAdmin()">
                    {{ $t('cody.adoption.askAdmin') }}
                </FormButton>
                <span v-else-if="variant === 'request'" class="text-sm font-medium text-ai-ink">
                    <Icon name="ph:check-circle" class="mr-1 inline h-4 w-4 text-ai" aria-hidden="true" />
                    {{ $t('cody.adoption.sent') }}
                </span>

                <button v-if="variant === 'trial' && isAdmin" type="button"
                    class="text-sm font-semibold text-ai-ink underline underline-offset-2" @click="navigateTo(appPath)">
                    {{ $t('cody.adoption.buy') }}
                </button>

                <p v-if="requestState === 'no_admin'" class="text-sm text-gray-600">{{ $t('cody.adoption.noAdmin') }}</p>
                <p v-if="requestState === 'error'" class="text-sm text-red-600">{{ $t('cody.adoption.requestFailed') }}</p>
            </div>
        </div>

        <button type="button" class="shrink-0 text-gray-500 hover:text-gray-900 transition-colors"
            :aria-label="$t('close')" @click="dismiss(variant === 'trial' ? 'trial' : variant === 'seats' ? 'seats' : 'banner')">
            <Icon name="ph:x" class="h-4 w-4" aria-hidden="true" />
        </button>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { trialDays } from '@/composables/managerSuggestion'
import { formatPrice } from '@/composables/customerSpecialPrice'
import { bannerSurface, bannerVariant, demandCount, priceLine, type BannerVariant, type NudgeEvent } from '@/composables/codyNudge'

// Where licence admins hand out Cody seats (the AI licence toggle per employee).
const SEATS_PATH = '/employees'

const { t } = useI18n()
const {
    status, isAdmin, hasAccess, requestState, appPath,
    load, requestFromAdmin, isDismissed, dismiss, recordNudge,
} = useCodyAdoption()

const daysLeft = computed(() => Math.max(0, Number(status.value?.trial?.days_left ?? 0)))
// From three days left the countdown stops being a footnote.
const urgent = computed(() => variant.value === 'trial' && daysLeft.value <= 3)

const showUpgrade = useCanPurchase()

// The rules are in composables/codyNudge.ts: a company that has Cody is never offered it.
const variant = computed<BannerVariant | null>(() => bannerVariant({
    status: status.value,
    canPurchase: showUpgrade.value,
    hasAccess: hasAccess.value,
    trialDismissed: isDismissed('trial'),
    bannerDismissed: isDismissed('banner'),
    seatsDismissed: isDismissed('seats'),
}))

const demand = computed(() => demandCount(status.value))

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
        case 'seats': return t('cody.adoption.seats.title', { count: demand.value }, demand.value)
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

// The demand line belongs to the buy banners; the seats banner says it in its title.
const demandText = computed(() => {
    if (variant.value !== 'adminTrial' && variant.value !== 'adminEnable') return ''
    return demand.value > 0 ? t('cody.adoption.demand', { count: demand.value }, demand.value) : ''
})

const priceText = computed(() => {
    if (variant.value !== 'adminTrial' && variant.value !== 'adminEnable') return ''
    const line = priceLine(status.value, showUpgrade.value, formatPrice)
    if (!line) return ''
    return line.count !== undefined ? t(line.key, line.params, line.count) : t(line.key, line.params)
})

function act(event: NudgeEvent, path: string) {
    const surface = bannerSurface(variant.value)
    if (surface) recordNudge(event, surface)
    navigateTo(path)
}

// Counted when it is actually on screen, i.e. it has the prompt slot.
watch(() => [variant.value, granted.value] as const, ([v, isGranted]) => {
    const surface = bannerSurface(v)
    if (surface && isGranted) recordNudge('impression', surface)
}, { immediate: true })

onMounted(() => load())
</script>
