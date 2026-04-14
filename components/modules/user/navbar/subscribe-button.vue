<template>
    <div class="py-1">
        <button @click="navigateTo('/subscription/subscribe')"
            class="px-4 py-2.5 w-full bg-orange-50 text-amber-700 border-[1.5px] border-orange-200 hover:border-amber-500">
            <p class="text-xs font-semibold">
                {{ $t('subscription.noSubscription.upgradeNow') }}
            </p>
        </button>
    </div>
</template>