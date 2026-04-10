<template>
    <div class="py-1">
        <button @click="navigateTo('/subscription/subscribe')" class="w-full btn-amber">
            <p class="text-xs font-semibold">
                {{ $t('subscription.noSubscription.upgradeNow') }}
            </p>
        </button>
    </div>
</template>