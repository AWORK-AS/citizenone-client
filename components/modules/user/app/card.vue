<template>
    <article
        class="app-card group relative flex h-full flex-col gap-3 rounded-xl border bg-white p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
        :class="props.app?.user_activated ? 'border-primary/30' : 'border-gray-200'">

        <!-- The whole card opens the app page. The buttons below sit above this
             overlay, so they still do their own thing. -->
        <NuxtLink :to="appPath" class="absolute inset-0 z-0 rounded-xl"
            :aria-label="$t('apps.readMoreAbout', { name: props.app?.name })" />

        <div class="flex items-start gap-3">
            <div v-if="useIconTile"
                class="brand-tile flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-white shadow-sm">
                <Icon :name="appIcon" class="h-6 w-6" />
            </div>
            <img v-else-if="props.app?.logo" :src="props.app.logo" :alt="props.app?.name"
                class="h-12 w-12 flex-shrink-0 rounded-lg border border-gray-100 bg-white object-contain p-1" />
            <div v-else
                class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg font-semibold text-primary">
                {{ (props.app?.name || '?').charAt(0).toUpperCase() }}
            </div>

            <div class="min-w-0 flex-1">
                <h3 class="truncate text-base font-semibold leading-tight text-muted-800">
                    {{ props.app?.name }}
                </h3>
                <p class="mt-0.5 truncate text-xs text-gray-500">{{ byline }}</p>
            </div>

            <span v-if="badge" :class="['app-badge', `app-badge-${badge.tone}`]">
                {{ badge.key === 'apps.badge.discount' ? $t(badge.key, { percent: price.discountPercent }) : $t(badge.key) }}
            </span>
        </div>

        <p class="line-clamp-2 text-sm leading-relaxed text-gray-600">
            {{ props.app?.tagline || props.app?.description }}
        </p>

        <div class="mt-auto">
            <p class="text-sm text-muted-800">
                <template v-if="price.isFree">
                    <span class="font-semibold">{{ $t('apps.free') }}</span>
                </template>
                <template v-else-if="price.hasDiscount">
                    <span class="mr-1 text-muted-400 line-through">{{ formatAmount(price.amount) }}</span>
                    <span class="font-semibold text-primary">{{ formatAmount(price.discountedAmount) }}</span>
                    <span v-if="price.unit" class="lowercase text-gray-500">/{{ price.unit }}</span>
                </template>
                <template v-else>
                    <span class="font-semibold">{{ formatAmount(price.amount) }}</span>
                    <span v-if="price.unit" class="lowercase text-gray-500">/{{ price.unit }}</span>
                </template>
                <span v-if="!price.isFree" class="ml-1 text-xs text-gray-500">{{ $t('excludeVat') }}</span>
            </p>
            <p v-for="note in price.notes" :key="note" class="text-xs text-muted-500">{{ note }}</p>
            <p v-if="price.hasDiscount && price.daysLeft !== null" class="text-xs font-medium text-red-600">
                <span v-if="price.daysLeft < 1">{{ $t('apps.offerEndsToday') }}</span>
                <span v-else>{{ $t('apps.offerEndsInDays', { count: price.daysLeft }) }}</span>
            </p>
        </div>

        <div class="relative z-10 flex items-center gap-2">
            <FormButton type="button" buttonStyle="action" class="w-full"
                v-if="props.app?.url_field" @click="emit('goToPartner', props.app?.url_field)">
                {{ $t('apps.goToPartner') }}
            </FormButton>
            <FormButton type="button" buttonStyle="primary" class="w-full"
                v-else-if="props.app?.user_activated && destination" @click="navigateTo(destination.path)">
                {{ destination.open ? $t('apps.openApp') : $t('apps.goToSetup') }}
            </FormButton>
            <FormButton type="button" buttonStyle="app-order-now" class="w-full"
                v-else-if="props.app?.user_activated && props.app?.is_quantifiable"
                @click="emit('activate', props.app)">
                {{ $t('apps.buyMoreLicenses') }}
            </FormButton>
            <FormButton type="button" buttonStyle="app-activated" class="w-full cursor-not-allowed"
                v-else-if="props.app?.user_activated" disabled>
                {{ $t('apps.activated') }}
            </FormButton>
            <FormButton type="button" buttonStyle="app-order-now" class="w-full" v-else
                @click="emit('activate', props.app)">
                {{ props.app?.is_one_time_fee ? $t('apps.orderNow') : $t('apps.activate') }}
            </FormButton>
        </div>
    </article>
</template>

<script setup lang="ts">
import { appBadgeFor, useAppPrice } from '@/composables/appPrice'

const props = defineProps({
    app: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['goToPartner', 'activate'])

const { appPrice, formatAmount } = useAppPrice()

const destination = computed(() => appDestinationFor(props.app))
const appIcon = computed(() => appIconFor(props.app).icon)
const useIconTile = computed(() => appIconFor(props.app).useTile)
const price = computed(() => appPrice(props.app))
const badge = computed(() => appBadgeFor(props.app))

// Apps that arrived before slugs were introduced fall back to their uuid, so a
// card never links nowhere.
const appPath = computed(() => `/apps/${props.app?.slug || props.app?.uuid}`)

const byline = computed(() =>
    [props.app?.publisher, props.app?.category?.name].filter(Boolean).join(' · ')
)
</script>

<style scoped>
/* .brand-tile lives in assets/css/main.css so the app page can reuse it too. */
@media (prefers-reduced-motion: reduce) {
    .app-card {
        transition: none !important;
    }

    .app-card:hover {
        transform: none !important;
    }
}
</style>
