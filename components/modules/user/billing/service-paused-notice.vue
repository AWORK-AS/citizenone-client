<template>
    <div v-if="props.paused" role="alert" data-testid="service-paused-notice"
        class="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3 text-amber-900">
        <Icon name="ph:pause-circle" class="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
        <div class="min-w-0 flex-1">
            <p class="text-sm font-medium">{{ $t(`paymentDunning.paused.${props.service}`) }}</p>
            <p v-if="!canManage" class="text-sm mt-0.5 opacity-90">{{ $t('paymentDunning.paused.adminOnly') }}</p>
        </div>
        <Tooltip v-if="canManage" :text="$t('paymentDunning.paused.updateCardHelp')" position="top" wrap>
            <FormButton type="button" buttonStyle="primary" @click="navigateTo('/settings/subscription')">
                {{ $t('paymentDunning.paused.updateCard') }}
            </FormButton>
        </Tooltip>
    </div>
</template>

<script setup lang="ts">
/**
 * A failed AI or SMS top-up pauses that service only; the company is not closed.
 * The notice says which service and where to fix it. The API is what actually
 * blocks the service, so hiding this notice never re-enables anything.
 */
const props = defineProps({
    service: { type: String as () => 'ai' | 'sms', required: true },
    paused: { type: Boolean, default: false },
})

const { isAtLeast } = usePermissions()
const canManage = computed(() => isAtLeast('Admin'))
</script>
