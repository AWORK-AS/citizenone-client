<template>
    <span v-if="twoFactorStatus(props.user) === 'on'" class="co-2fa-badge co-2fa-on"
        :title="$t('superadmin.twoFactor.sectionTitle')">
        <Icon name="ph:shield-check" class="w-3 h-3" />
        {{ $t('superadmin.twoFactor.statusOn') }}
    </span>
    <span v-else class="co-2fa-badge co-2fa-off" :title="$t('superadmin.twoFactor.sectionTitle')">
        <Icon name="ph:shield-warning" class="w-3 h-3" />
        {{ $t('superadmin.twoFactor.statusOff') }}
    </span>
</template>

<script setup lang="ts">
import { twoFactorStatus } from '@/composables/staffTwoFactor'

const props = defineProps({
    user: { type: Object, default: null },
})
</script>

<style scoped>
.co-2fa-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    border: 1px solid;
    white-space: nowrap;
}

.co-2fa-on {
    background: #f0faf9;
    border-color: #2dbab2;
    color: #1b6d8a;
}

.co-2fa-off {
    background: #fff7ed;
    border-color: #fed7aa;
    color: #c2410c;
}
</style>
