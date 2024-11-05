<template>
    <button @click="navigateTo('/subscription/subscribe')" class="w-full bg-white rounded-md p-4">
        <p class="text-sm text-primary font-bold">
            {{ $t('subscription.noSubscription.subscribeNow') }}
        </p>
    </button>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'
const userStore = useUserStore() as any
</script>