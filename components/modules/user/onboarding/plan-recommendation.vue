<template>
    <!-- The plan that fits the team they told us about, shown only while they
         are on the free account. A suggestion with the reason next to it, never
         a wall: the free account keeps working. -->
    <section v-if="plan && !isDesktopApp" data-testid="plan-recommendation"
        class="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-start gap-4 min-w-0">
            <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-primary shrink-0">
                <Icon name="ph:users-three" class="h-6 w-6" aria-hidden="true" />
            </div>
            <div class="min-w-0">
                <p class="font-semibold text-slate-900">{{ $t(`teamSize.plan.${plan}.title`) }}</p>
                <p class="text-sm text-slate-600">{{ $t(`teamSize.plan.${plan}.desc`, { size: $t(`teamSize.options.${size}`) }) }}</p>
            </div>
        </div>
        <button type="button" @click="navigateTo('/subscription/subscribe')"
            class="shrink-0 inline-flex items-center justify-center gap-x-1.5 rounded-lg border border-primary/30 text-primary px-4 py-2.5 text-sm font-semibold hover:bg-primary/5 transition-colors">
            {{ $t('teamSize.plan.cta') }}
            <Icon name="ph:arrow-right" class="h-4 w-4" aria-hidden="true" />
        </button>
    </section>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'
import { isTeamSize, recommendedPlan } from '@/composables/teamSize'

const isDesktopApp = useIsDesktopApp()

const userStore = useUserStore() as any

const size = computed(() => {
    const value = userStore.getUser?.company?.onboarding_preferences?.team_size
    return isTeamSize(value) ? value : null
})

// `free_account` is only true for a company without an active Basis/Pro deal;
// an older backend without the field shows nothing rather than guessing.
const plan = computed(() => (userStore.getUser?.free_account === true ? recommendedPlan(size.value) : null))
</script>
