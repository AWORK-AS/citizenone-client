<template>
    <div class="text-xs text-primary text-center">
        {{ $t('sidebar.companyId') }}:
        <span v-if="userStore.getUser?.company?.id">
            74312{{ String(userStore.getUser?.company?.id) }}
        </span>
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'
const userStore = useUserStore() as any
</script>