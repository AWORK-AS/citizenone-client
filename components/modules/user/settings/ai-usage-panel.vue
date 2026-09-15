<template>
    <div>
        <div v-if="state.loading" class="text-sm text-gray-500">
            {{ $t('aiUsage.loading') }}
        </div>

        <div v-else-if="state.failed" class="rounded-lg border-1.5 border-gray-200 bg-white p-6 text-sm text-gray-600">
            {{ $t('aiUsage.failed') }}
        </div>

        <div v-else class="flex flex-col gap-y-6">
            <!-- Today first. Of everything on this page it is the only number
                 that can stop someone mid-shift, so it leads. -->
            <section class="rounded-lg border-1.5 border-gray-200 bg-white p-6">
                <div class="flex items-baseline justify-between gap-x-4">
                    <h3 class="text-sm font-semibold text-gray-900">{{ $t('aiUsage.today') }}</h3>
                    <p class="text-sm tabular-nums text-gray-600">
                        {{ $t('aiUsage.ofAllowance', { used: state.data.used_today, allowance: state.data.daily_allowance }) }}
                    </p>
                </div>

                <div class="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div class="h-full rounded-full transition-all duration-500"
                        :class="todayShare > 0.9 ? 'bg-orange-400' : 'bg-primary'"
                        :style="{ width: `${Math.min(100, todayShare * 100)}%` }" />
                </div>

                <p class="mt-3 text-xs text-gray-500">{{ $t('aiUsage.allowanceExplainer') }}</p>
            </section>

            <!-- Only for companies that bought capacity. Showing an empty
                 balance to everyone else would read as a problem they have. -->
            <section v-if="state.data.budget_enabled" class="rounded-lg border-1.5 border-gray-200 bg-white p-6">
                <div class="flex flex-wrap items-baseline justify-between gap-4">
                    <div>
                        <h3 class="text-sm font-semibold text-gray-900">{{ $t('aiUsage.balance') }}</h3>
                        <p class="mt-1 text-3xl font-semibold tabular-nums text-gray-900">
                            {{ kr(state.data.balance_kroner) }}
                        </p>
                    </div>
                    <FormButton buttonStyle="AI" buttonSize="xs" class="px-4" @click="buyMore">
                        {{ $t('aiUsage.buyMore') }}
                    </FormButton>
                </div>

                <p class="mt-3 text-xs text-gray-500">{{ $t('aiUsage.balanceExplainer') }}</p>
            </section>

            <section class="rounded-lg border-1.5 border-gray-200 bg-white p-6">
                <div class="flex items-baseline justify-between gap-x-4">
                    <h3 class="text-sm font-semibold text-gray-900">{{ $t('aiUsage.thisMonth') }}</h3>
                    <p class="text-sm font-semibold tabular-nums text-gray-900">
                        {{ kr(state.data.month_charged_kroner) }}
                    </p>
                </div>

                <!-- A bar per day, including the quiet ones. Dropping empty days
                     would make a busy Tuesday look like steady spending. -->
                <div class="mt-4 flex h-24 items-end gap-x-[3px]">
                    <div v-for="day in state.data.daily" :key="day.date"
                        class="flex-1 rounded-sm bg-primary/70 transition-all hover:bg-primary"
                        :style="{ height: `${barHeight(day.charged_kroner)}%` }"
                        :title="`${shortDate(day.date)}: ${kr(day.charged_kroner)}`" />
                </div>
                <div class="mt-1.5 flex justify-between text-[11px] text-gray-400">
                    <span>{{ shortDate(state.data.daily[0]?.date) }}</span>
                    <span>{{ shortDate(state.data.daily[state.data.daily.length - 1]?.date) }}</span>
                </div>

                <div class="mt-6 overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                <th class="pb-2">{{ $t('aiUsage.feature') }}</th>
                                <th class="pb-2 text-right">{{ $t('aiUsage.uses') }}</th>
                                <th class="pb-2 text-right">{{ $t('aiUsage.amount') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="row in state.data.by_feature" :key="row.feature" class="border-b border-gray-100 last:border-0">
                                <td class="py-2.5 text-gray-900">{{ featureLabel(row.feature) }}</td>
                                <td class="py-2.5 text-right tabular-nums text-gray-600">
                                    {{ row.minutes > 0 ? $t('aiUsage.minutes', { count: row.minutes }) : row.requests }}
                                </td>
                                <td class="py-2.5 text-right tabular-nums text-gray-900">{{ kr(row.charged_kroner) }}</td>
                            </tr>
                            <tr v-if="!state.data.by_feature.length">
                                <td colspan="3" class="py-4 text-center text-gray-500">{{ $t('aiUsage.noneThisMonth') }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <!-- The other half of the ledger. A balance nobody can trace back to
                 a purchase is a number to be taken on trust. -->
            <ModulesUserSettingsAiCapacityPurchase :isModalOpen="state.buying" :topupApp="state.data.topup_app"
                @close="state.buying = false" />

            <section v-if="state.data.topups.length" class="rounded-lg border-1.5 border-gray-200 bg-white p-6">
                <h3 class="text-sm font-semibold text-gray-900">{{ $t('aiUsage.purchases') }}</h3>

                <ul class="mt-3 flex flex-col divide-y divide-gray-100">
                    <li v-for="(topup, index) in state.data.topups" :key="index"
                        class="flex items-baseline justify-between gap-x-4 py-2.5 text-sm">
                        <span class="text-gray-600">{{ date(topup.purchased_at) }}</span>
                        <span class="tabular-nums text-gray-900">+{{ kr(topup.amount_kroner) }}</span>
                    </li>
                </ul>
            </section>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { aiUsageService } from '@/components/api/user/AiUsageService'

const { t, locale } = useI18n()

const state = reactive({
    loading: true,
    failed: false,
    buying: false,
    data: {
        budget_enabled: false,
        balance_kroner: 0,
        used_today: 0,
        daily_allowance: 0,
        month_charged_kroner: 0,
        by_feature: [] as any[],
        daily: [] as any[],
        topups: [] as any[],
        topup_app: null as any,
    },
})

/**
 * Buying happens here rather than on the catalogue. An admin who has just read
 * "you have 380 kroner left" is answering a question about an amount, and
 * sending them off to find a tile and pick a quantity answers a different one.
 *
 * The payment is not reimplemented: the dialog calls the same endpoint every app
 * purchase uses and renders the same Nexi checkout. Only the chooser is new.
 *
 * The catalogue stays as the fallback when the product is not seeded in this
 * environment - wrong but harmless, better than a dialog with nothing to sell.
 */
function buyMore() {
    if (state.data.topup_app?.uuid) {
        state.buying = true
        return
    }
    navigateTo('/apps')
}

const todayShare = computed(() => {
    const allowance = Number(state.data.daily_allowance) || 0
    return allowance > 0 ? Number(state.data.used_today) / allowance : 0
})

const peakDay = computed(() => Math.max(
    ...state.data.daily.map((day: any) => Number(day.charged_kroner) || 0),
    0.01,
))

function barHeight(kroner: number) {
    // A floor of 2% so a day with a single question is still a visible mark
    // rather than an invisible one that reads as "nothing happened".
    const share = (Number(kroner) || 0) / peakDay.value
    return kroner > 0 ? Math.max(2, share * 100) : 0
}

function kr(value: number) {
    return new Intl.NumberFormat(locale.value === 'en' ? 'en-GB' : 'da-DK', {
        style: 'currency',
        currency: 'DKK',
        maximumFractionDigits: 2,
    }).format(Number(value) || 0)
}

function shortDate(value: string | null | undefined) {
    if (!value) return ''
    return new Date(value).toLocaleDateString(locale.value === 'en' ? 'en-GB' : 'da-DK', {
        day: 'numeric', month: 'short',
    })
}

function date(value: string | null) {
    if (!value) return ''
    return new Date(value).toLocaleDateString(locale.value === 'en' ? 'en-GB' : 'da-DK', {
        day: 'numeric', month: 'short', year: 'numeric',
    })
}

/**
 * The backend names features the way the code does - assistant, transcribe,
 * journal, handover, classifier. Those are our words, not the customer's, so
 * they are translated here and fall back to the raw key rather than showing
 * nothing when a new feature starts being measured before anyone names it.
 */
function featureLabel(feature: string) {
    const key = `aiUsage.features.${feature}`
    const label = t(key)
    return label === key ? feature : label
}

async function load() {
    try {
        const response = await aiUsageService.overview()
        state.data = { ...state.data, ...(response?.data ?? response) }
    } catch {
        state.failed = true
    } finally {
        state.loading = false
    }
}

onMounted(load)
</script>
