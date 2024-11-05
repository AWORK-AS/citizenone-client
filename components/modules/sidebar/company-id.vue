<template>
    <div class="text-xs text-white text-center">
        {{ $t('sidebar.companyId') }}:
        {{ String(userStore.getUser?.company?.id).padStart(6, '0') }}
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'
const userStore = useUserStore() as any
</script>