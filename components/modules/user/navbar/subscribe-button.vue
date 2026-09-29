<template>
    <!-- Same height, radius and weight as the other top-bar controls; it was a
         square-cornered box a size larger than its neighbours. -->
    <button type="button" @click="navigateTo('/subscription/subscribe')"
        class="inline-flex h-9 items-center gap-x-1.5 rounded-lg bg-amber-50 px-3 text-sm font-semibold text-amber-800 ring-1 ring-inset ring-amber-200 hover:bg-amber-100 transition-colors whitespace-nowrap">
        <Icon name="ph:arrow-circle-up" class="h-4 w-4 shrink-0" aria-hidden="true" />
        {{ $t('subscription.noSubscription.upgradeNow') }}
    </button>
</template>