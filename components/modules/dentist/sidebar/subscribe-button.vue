<template>
    <div class="py-1">
        <button @click="navigateTo('/subscription/subscribe')" class="w-full bg-secondary rounded-md p-4">
            <p class="text-sm text-white font-semibold">
                {{ $t('subscription.noSubscription.upgradeNow') }}
            </p>
        </button>
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'
const userStore = useUserStore() as any
</script>