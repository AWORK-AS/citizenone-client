<template>
    <div class="app-card relative flex flex-col bg-white px-7 py-6 border rounded-xl transition duration-200 hover:shadow-lg hover:-translate-y-1"
        :class="props.app?.user_activated ? 'border-[#02c18e]/40' : 'border-gray-200'">

        <!-- Badge row -->
        <div v-if="hasAnyBadge" class="flex flex-wrap items-center gap-1.5 mb-4">
            <span v-if="props.app?.user_activated"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xxs font-semibold bg-[#02c18e] text-white">
                <Icon name="ph:check-bold" class="w-3 h-3" />
                {{ $t('apps.activated') }}
            </span>
            <span v-if="appHasDiscount"
                class="inline-flex items-center px-2 py-0.5 rounded-full text-xxs font-semibold bg-red-600 text-white">
                {{ $t('apps.badge.discount', { percent: discountPercent }) }}
            </span>
            <span v-if="props.app?.is_popular"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xxs font-semibold bg-secondary text-white">
                <Icon name="ic:sharp-trending-up" class="w-3 h-3" />
                {{ $t('apps.badge.popular') }}
            </span>
            <span v-if="props.app?.is_recommended"
                class="inline-flex items-center px-2 py-0.5 rounded-full text-xxs font-semibold bg-primary text-white">
                {{ $t('apps.badge.recommended') }}
            </span>
            <span v-if="props.app?.is_news"
                class="inline-flex items-center px-2 py-0.5 rounded-full text-xxs font-semibold bg-primary/10 text-primary">
                {{ $t('apps.badge.news') }}
            </span>
            <span v-if="props.app?.is_thirdparty"
                class="inline-flex items-center px-2 py-0.5 rounded-full text-xxs font-semibold bg-gray-100 text-gray-600">
                {{ $t('apps.thirdPartyApp') }}
            </span>
        </div>

        <!-- Header: logo + category chip + name -->
        <div class="flex items-start gap-3 mb-3">
            <!-- CitizenONE-native apps get a branded gradient tile with a white
                 glyph, so they read as one premium product family instead of all
                 reusing the generic CitizenONE logo. Third-party apps keep their
                 own vendor logo. -->
            <div v-if="useIconTile"
                class="brand-tile w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-sm">
                <Icon :name="appIcon" class="w-7 h-7" />
            </div>
            <img v-else-if="props.app?.logo" :src="props.app.logo" alt="App logo"
                class="w-14 h-14 object-contain rounded-lg flex-shrink-0 border border-gray-100 p-1 bg-white" />
            <div v-else
                class="w-14 h-14 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xl font-semibold flex-shrink-0">
                {{ (props.app?.name || '?').charAt(0).toUpperCase() }}
            </div>
            <div class="min-w-0">
                <span v-if="props.app?.category?.name"
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xxs font-medium bg-gray-100 text-gray-600 mb-1">
                    <Icon v-if="props.app?.category?.icon" :name="props.app.category.icon" class="w-3 h-3" />
                    {{ props.app.category.name }}
                </span>
                <h4 class="text-muted-800 text-lg font-semibold leading-tight truncate">
                    {{ props.app?.name }}
                </h4>
            </div>
        </div>

        <!-- Description -->
        <p class="text-gray-600 font-sans text-base line-clamp-2 mb-3">
            {{ props.app?.description }}
        </p>

        <!-- Social proof -->
        <p v-if="props.app?.install_count > 0" class="flex items-center gap-1 text-xs text-gray-500 mb-3">
            <Icon name="ph:buildings" class="w-3.5 h-3.5" />
            {{ $t('apps.usedBy', { count: props.app.install_count }) }}
        </p>

        <!-- Price block -->
        <div class="mt-auto">
            <p class="text-muted-800 text-sm">
                <template v-if="appHasDiscount">
                    <span class="line-through text-muted-400 mr-1">{{ formatAmount(headlinePrice) }}</span>
                    <span class="font-semibold text-primary">{{ formatAmount(discountedPrice) }}</span>
                </template>
                <template v-else>
                    <span>{{ formatAmount(headlinePrice) }}</span>
                </template>
                <span v-if="!props.app?.is_one_time_fee" class="lowercase">/{{ priceUnit }}</span>
                {{ $t('excludeVat') }}
            </p>
            <p v-if="hasSubscriptionBaseFee" class="text-xs text-muted-500 mt-0.5">
                + {{ formatAmount(basePrice) }} {{ $t('apps.perUserSuffix') }}
            </p>
            <p v-if="props.app?.setup_fee > 0" class="text-xs text-muted-500 mt-0.5">
                + {{ formatAmount(props.app?.setup_fee) }} {{ $t('apps.setupFeeSuffix') }}
            </p>
            <p v-if="appHasDiscount && daysLeft !== null" class="text-xs font-medium text-red-600 mt-0.5">
                <span v-if="daysLeft < 1">{{ $t('apps.offerEndsToday') }}</span>
                <span v-else>{{ $t('apps.offerEndsInDays', { count: daysLeft }) }}</span>
            </p>
        </div>

        <!-- CTA -->
        <div class="flex items-center gap-2 mt-4">
            <FormButton type="button" buttonStyle="action" class="w-full" @click="emit('readMore', props.app)">
                {{ $t('apps.readMore') }}
            </FormButton>
            <FormButton type="button" buttonStyle="action" class="w-full"
                @click="emit('goToPartner', props.app?.url_field)" v-if="props.app?.url_field">
                {{ $t('apps.goToPartner') }}
            </FormButton>
            <FormButton type="button" :buttonStyle="props.app?.user_activated ? 'app-activated' : 'app-order-now'"
                :class="[
                    props.app?.user_activated && 'cursor-not-allowed',
                    'w-full'
                ]" color="primary" @click="!props.app?.user_activated && emit('activate', props.app)" v-else>
                <span v-if="props.app?.user_activated">
                    {{ $t('apps.activated') }}
                </span>
                <span v-else-if="props.app?.is_one_time_fee">
                    {{ $t('apps.orderNow') }}
                </span>
                <span v-else>
                    {{ $t('apps.activate') }}
                </span>
            </FormButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { useUserStore } from '@/store/user'
import { useAmountFormatter } from '@/composables/amountFormatter'

const props = defineProps({
    app: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['readMore', 'goToPartner', 'activate'])

const appIcon = computed(() => appIconFor(props.app).icon)
const useIconTile = computed(() => appIconFor(props.app).useTile)

const userStore = useUserStore() as any
const { formatAmount } = useAmountFormatter()
const { t } = useI18n()

const isYearly = computed(() =>
    ['yearly', 'custom_yearly'].includes(userStore.getUser?.user_subscription?.type)
)

const hasAnyBadge = computed(() =>
    !!(props.app?.user_activated || appHasDiscount.value || props.app?.is_popular ||
        props.app?.is_recommended || props.app?.is_news || props.app?.is_thirdparty)
)

const basePrice = computed(() => {
    if (props.app?.is_one_time_fee) return Number(props.app?.price) || 0
    if (isYearly.value) return Number(props.app?.yearly_price) || 0
    return Number(props.app?.monthly_price) || 0
})

const priceUnit = computed(() => (isYearly.value ? t('apps.year') : t('apps.month')))

// Apps sold as a base subscription plus a price per unit (third party access:
// 129/mo plus 29 per third party) lead with the base and list the unit price.
const subscriptionBasePrice = computed(() => {
    if (props.app?.is_one_time_fee) return 0
    if (isYearly.value) return Number(props.app?.base_yearly_price) || 0
    return Number(props.app?.base_monthly_price) || 0
})

const hasSubscriptionBaseFee = computed(() => subscriptionBasePrice.value > 0)

const headlinePrice = computed(() => (hasSubscriptionBaseFee.value ? subscriptionBasePrice.value : basePrice.value))

const appHasDiscount = computed(() =>
    !!(props.app?.has_active_discount && Number(props.app?.discount_percent) > 0)
)

const discountPercent = computed(() => Math.round(Number(props.app?.discount_percent) || 0))

const discountedPrice = computed(() => {
    if (!appHasDiscount.value) return headlinePrice.value
    return Math.round(headlinePrice.value * (1 - discountPercent.value / 100))
})

const daysLeft = computed(() => {
    if (!props.app?.discount_ends_at) return null
    const end = new Date(props.app.discount_ends_at)
    if (isNaN(end.getTime())) return null
    const diff = end.getTime() - Date.now()
    if (diff <= 0) return 0
    return Math.floor(diff / 86400000)
})
</script>

<style scoped>
/* .brand-tile lives in assets/css/main.css so the modal can reuse it too. */
@media (prefers-reduced-motion: reduce) {
    .app-card {
        transition: none !important;
    }

    .app-card:hover {
        transform: none !important;
    }
}
</style>
