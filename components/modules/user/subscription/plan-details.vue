<template>
    <!-- Price, who the plan is for, and what it includes, worded as on the CitizenOne homepage. -->
    <div data-testid="plan-details">
        <p class="mt-4 flex items-baseline gap-x-2">
            <span :class="[props.dark ? 'text-white' : 'text-gray-900', 'text-4xl font-light tracking-tight']">
                {{ formatWholeAmount(monthlyPrice, locale) }}
            </span>
            <span :class="[props.dark ? 'text-gray-200' : 'text-gray-500', 'text-sm']">
                {{ $t('subscription.plan.perMonth') }}
            </span>
        </p>
        <p :class="[props.dark ? 'text-gray-200' : 'text-gray-500', 'mt-1 text-sm']">
            <template v-if="billedYearly !== null">
                {{ $t('subscription.plan.billedYearly', { amount: formatWholeAmount(billedYearly, locale) }) }}
            </template>
            <template v-else>{{ $t('subscription.plan.billedMonthly') }}</template>
        </p>

        <p :class="[props.dark ? 'text-gray-100' : 'text-gray-600', 'mt-6 text-sm leading-6']">
            {{ $t(planTaglineKey(props.deal)) }}
        </p>

        <ul role="list" :class="[props.dark ? 'text-gray-100' : 'text-gray-700', 'mt-8 space-y-3 text-sm leading-6']">
            <li v-for="feature in features" :key="feature.key" class="flex gap-x-2">
                <Icon name="ph:check" :class="[props.dark ? 'text-secondary' : 'text-primary', 'h-6 w-5 flex-none']"
                    aria-hidden="true" />
                <span>{{ $t(feature.key, feature.params ?? {}, Number(feature.params?.count ?? 1)) }}</span>
                <Tooltip v-if="feature.extraPrice"
                    :text="$t('subscription.plan.extraPerMonth', { amount: formatWholeAmount(feature.extraPrice, locale) })"
                    class="cursor-help flex items-center">
                    <Icon name="ph:info" class="h-4 w-4" aria-hidden="true" />
                </Tooltip>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {
    formatWholeAmount,
    planBilledYearly,
    planFeatures,
    planMonthlyPrice,
    planTaglineKey,
    type PlanDeal,
    type PlanFrequency,
} from '@/composables/planCard'

const props = defineProps({
    deal: { type: Object as () => PlanDeal, required: true },
    frequency: { type: String as () => PlanFrequency, required: true },
    /** The highlighted (dark) card. */
    dark: { type: Boolean, default: false },
})

const { locale } = useI18n()

const monthlyPrice = computed(() => planMonthlyPrice(props.deal, props.frequency))
const billedYearly = computed(() => planBilledYearly(props.deal, props.frequency))
const features = computed(() => planFeatures(props.deal))
</script>
