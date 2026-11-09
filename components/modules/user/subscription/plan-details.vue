<template>
    <!--
        A plan card's body, laid out and worded as the pricing on the CitizenOne homepage: who the plan is for, the
        price per month and what is billed, the action (the default slot), and what the plan includes.
    -->
    <div data-testid="plan-details">
        <p :class="[props.dark ? 'text-gray-300' : 'text-gray-500', 'mt-3 text-sm leading-6']">
            {{ $t(planTaglineKey(props.deal)) }}
        </p>

        <p class="mt-8 flex items-baseline gap-x-2">
            <span :class="[props.dark ? 'text-white' : 'text-gray-900', 'text-5xl font-light tracking-tight']">
                {{ formatWholeAmount(monthlyPrice, locale) }}
            </span>
            <span :class="[props.dark ? 'text-gray-300' : 'text-gray-500', 'text-sm']">
                {{ $t('subscription.plan.perMonth') }}
            </span>
        </p>
        <p :class="[props.dark ? 'text-gray-300' : 'text-gray-500', 'mt-2 text-sm']">
            <template v-if="billedYearly !== null">
                {{ $t('subscription.plan.billedYearly', { amount: formatWholeAmount(billedYearly, locale) }) }}
            </template>
            <template v-else>{{ $t('subscription.plan.billedMonthly') }}</template>
        </p>

        <div v-if="$slots.default" class="mt-8">
            <slot />
        </div>

        <ul role="list"
            :class="[props.dark ? 'text-gray-200 border-white/10' : 'text-gray-700 border-gray-200', 'mt-8 border-t pt-8 space-y-3 text-sm leading-6']">
            <li v-for="feature in features" :key="feature.key" class="flex gap-x-3">
                <Icon name="ph:check-bold" class="h-6 w-4 flex-none text-secondary-400" aria-hidden="true" />
                <span>{{ $t(feature.key, feature.params ?? {}, Number(feature.params?.count ?? 1)) }}</span>
                <Tooltip v-if="feature.extraPrice"
                    :text="$t('subscription.plan.extraPerMonth', { amount: formatWholeAmount(feature.extraPrice, locale) })"
                    class="cursor-help flex items-center">
                    <Icon name="ph:info" :class="[props.dark ? 'text-gray-400' : 'text-gray-400', 'h-4 w-4']" aria-hidden="true" />
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
