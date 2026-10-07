<template>
    <div>
        <div v-if="state.loading" class="text-sm text-gray-500">
            {{ $t('aiUsage.loading') }}
        </div>

        <div v-else-if="state.failed" class="rounded-lg border-1.5 border-gray-200 bg-white p-6 text-sm text-gray-600">
            {{ state.forbidden ? $t('aiUsage.forbidden') : $t('aiUsage.failed') }}
        </div>

        <div v-else class="flex flex-col gap-y-6">
            <!-- Today first. Of everything on this page it is the only number
                 that can stop someone mid-shift, so it leads. -->
            <section class="rounded-lg border-1.5 border-gray-200 bg-white p-6">
                <div class="flex items-baseline justify-between gap-x-4">
                    <h3 class="text-sm font-semibold text-gray-900">{{ $t('aiUsage.today') }}</h3>
                    <p class="text-sm tabular-nums text-gray-600">
                        {{ $t('aiUsage.ofAllowance', { used: includedToday, allowance: state.data.daily_allowance }) }}
                        <span v-if="beyondToday > 0" class="text-gray-900">
                            · {{ $t('aiUsage.beyondToday', { count: beyondToday }) }}
                        </span>
                    </p>
                </div>

                <div class="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div class="h-full rounded-full transition-all duration-500"
                        :class="todayShare > 0.9 ? 'bg-orange-400' : 'bg-primary'"
                        :style="{ width: `${Math.min(100, todayShare * 100)}%` }" />
                </div>

                <p class="mt-3 text-xs text-gray-500">
                    {{ $t('aiUsage.allowanceExplainer') }}
                    {{ hasBalance ? $t('aiUsage.allowanceThenBalance') : $t('aiUsage.allowanceThenStop') }}
                </p>
            </section>

            <!-- The balance once there is one; before that, the offer. This used
                 to show only after a first purchase, which left a customer who had
                 never bought with no way to buy from the page about buying. -->
            <section v-if="state.data.budget_enabled" class="rounded-lg border-1.5 border-gray-200 bg-white p-6">
                <div class="flex flex-wrap items-baseline justify-between gap-4">
                    <div>
                        <h3 class="flex items-center gap-x-1.5 text-sm font-semibold text-gray-900">
                            {{ $t('aiUsage.balance') }}
                            <Tooltip v-if="priceExample" :text="priceExample" wrap>
                            <Icon name="ph:info" class="h-4 w-4 text-gray-400 hover:text-primary" :aria-label="priceExample" />
                        </Tooltip>
                        </h3>
                        <p class="mt-1 text-3xl font-semibold tabular-nums text-gray-900">
                            {{ kr(state.data.balance_kroner) }}
                        </p>
                    </div>
                    <Tooltip :text="$t('aiUsage.buyHint')" wrap>
                        <FormButton buttonStyle="AI" buttonSize="xs" class="px-4" @click="buyMore">
                            {{ $t('aiUsage.buyMore') }}
                        </FormButton>
                    </Tooltip>
                </div>

                <p class="mt-3 text-xs text-gray-500">{{ $t('aiUsage.balanceExplainer') }}</p>
            </section>

            <section v-else class="rounded-lg border-1.5 border-gray-200 bg-white p-6">
                <div class="flex flex-wrap items-center justify-between gap-4">
                    <div class="min-w-0 flex-1">
                        <h3 class="flex items-center gap-x-1.5 text-sm font-semibold text-gray-900">
                            {{ $t('aiUsage.offer.title') }}
                            <Tooltip v-if="priceExample" :text="priceExample" wrap>
                            <Icon name="ph:info" class="h-4 w-4 text-gray-400 hover:text-primary" :aria-label="priceExample" />
                        </Tooltip>
                        </h3>
                        <p class="mt-1 text-sm text-gray-600">{{ $t('aiUsage.offer.body') }}</p>
                    </div>
                    <Tooltip :text="$t('aiUsage.buyHint')" wrap>
                        <FormButton buttonStyle="AI" buttonSize="xs" class="px-4" @click="buyMore">
                            {{ $t('aiUsage.offer.cta') }}
                        </FormButton>
                    </Tooltip>
                </div>
            </section>

            <section class="rounded-lg border-1.5 border-gray-200 bg-white p-6">
                <div class="flex items-baseline justify-between gap-x-4">
                    <h3 class="text-sm font-semibold text-gray-900">{{ $t('aiUsage.thisMonth') }}</h3>
                    <p class="text-sm font-semibold tabular-nums text-gray-900">
                        {{ kr(state.data.month_charged_kroner) }}
                    </p>
                </div>
                <p class="mt-1 text-xs text-gray-500">{{ $t('aiUsage.monthExplainer') }}</p>

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

                <!-- Who it went to. The usage was always recorded per person and
                     never shown, so a customer could see capacity going somewhere
                     and never where - and a limit nobody can attribute is a limit
                     people argue about. -->
                <div v-if="state.data.by_user?.length" class="mt-8">
                    <h3 class="text-sm font-semibold text-gray-900">{{ $t('aiUsage.byUser.title') }}</h3>
                    <p class="mt-0.5 text-xs text-gray-500">{{ $t('aiUsage.byUser.subtitle') }}</p>
                    <ul class="mt-3 divide-y divide-gray-100">
                        <li v-for="row in state.data.by_user" :key="row.name"
                            class="flex items-baseline gap-3 py-2 text-sm">
                            <span class="min-w-0 flex-1 truncate text-gray-900">{{ row.name }}</span>
                            <span class="tabular-nums text-gray-600">{{ $t('aiUsage.requests', { count: row.requests }) }}</span>
                            <span class="w-20 text-right tabular-nums text-gray-900">{{ kr(row.charged_kroner) }}</span>
                        </li>
                    </ul>
                </div>

                <!-- The ceiling, and whose it is. Set here rather than by us:
                     what counts as reasonable differs between a dentist with four
                     chairs and a care home with sixty staff. -->
                <div class="mt-8 rounded-xl border border-gray-200 p-4">
                    <h3 class="text-sm font-semibold text-gray-900">{{ $t('aiUsage.userLimit.title') }}</h3>
                    <p class="mt-1 text-xs text-gray-500">
                        {{ $t('aiUsage.userLimit.help', { company: state.data.daily_allowance }) }}
                    </p>
                    <div class="mt-3 flex flex-wrap items-center gap-2">
                        <input id="ai-user-limit" v-model="state.limitInput" type="number" min="1"
                            :max="state.data.daily_allowance || undefined"
                            :placeholder="String(state.data.user_daily_limit?.effective ?? '')"
                            class="w-28 rounded-lg border border-gray-200 px-3 py-2 text-sm tabular-nums focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                        <span class="text-sm text-gray-500">{{ $t('aiUsage.userLimit.perDay') }}</span>
                        <FormButton buttonSize="sm" :isLoading="state.savingLimit" @click="saveUserLimit">
                            {{ $t('save') }}
                        </FormButton>
                        <button v-if="state.data.user_daily_limit?.configured" type="button"
                            :disabled="state.savingLimit" @click="clearUserLimit"
                            class="text-sm text-gray-500 underline decoration-gray-300 hover:text-primary disabled:opacity-50">
                            {{ $t('aiUsage.userLimit.clear') }}
                        </button>
                    </div>
                    <p v-if="state.data.user_daily_limit?.lifted" class="mt-2 text-xs text-gray-400">
                        {{ $t('aiUsage.userLimit.lifted') }}
                    </p>
                    <p v-else class="mt-2 text-xs text-gray-400">
                        {{ state.data.user_daily_limit?.configured
                            ? $t('aiUsage.userLimit.set', { limit: state.data.user_daily_limit.configured })
                            : $t('aiUsage.userLimit.derived', { limit: state.data.user_daily_limit?.effective ?? 0 }) }}
                    </p>
                </div>
            </section>

            <!-- The other half of the ledger. A balance nobody can trace back to
                 a purchase is a number to be taken on trust. -->
            <ModulesUserSettingsAiAutoReload v-if="state.data.budget_enabled" :autoReload="state.data.auto_reload"
                :minimumKroner="state.data.topup_app?.minimum_kroner" @updated="load" />

            <ModulesUserSettingsAiCapacityPurchase :isModalOpen="state.buying" :topupApp="state.data.topup_app" :hasCard="!!state.data.auto_reload?.has_card"
                @close="state.buying = false" @purchased="load" />

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
import { useAlert } from '@/composables/alert'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const { successAlert, errorAlert } = useAlert()

const state = reactive({
    loading: true,
    failed: false,
    // A refusal, not an outage: "try again shortly" would never come true.
    forbidden: false,
    buying: false,
    savingLimit: false,
    // Left empty on purpose: the field shows the effective number as a
    // placeholder, so an admin who types nothing changes nothing.
    limitInput: '' as string | number,
    data: {
        budget_enabled: false,
        balance_kroner: 0,
        used_today: 0,
        daily_allowance: 0,
        month_charged_kroner: 0,
        by_feature: [] as any[],
        by_user: [] as any[],
        user_daily_limit: null as any,
        daily: [] as any[],
        topups: [] as any[],
        topup_app: null as any,
        pricing: null as any,
        auto_reload: null as any,
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

/**
 * Save, or clear, how much of a day one person may use.
 *
 * The server clamps to the company's own allowance and answers with the whole
 * overview, so the screen redraws from what was actually stored rather than
 * from what was typed - which is the difference between a number the customer
 * set and a number they think they set.
 */
async function saveUserLimit() {
    const typed = String(state.limitInput).trim()

    if (typed === '') return

    state.savingLimit = true
    try {
        const response = await aiUsageService.updateUserDailyLimit(Number(typed))
        apply(response)
        state.limitInput = ''
        successAlert(t('alert.success'), t('aiUsage.userLimit.saved'))
    } catch {
        errorAlert(t('alert.error'), t('alert.somethingWentWrong'))
    }
    state.savingLimit = false
}

async function clearUserLimit() {
    state.savingLimit = true
    try {
        const response = await aiUsageService.updateUserDailyLimit(null)
        apply(response)
        state.limitInput = ''
    } catch {
        errorAlert(t('alert.error'), t('alert.somethingWentWrong'))
    }
    state.savingLimit = false
}

const hasBalance = computed(() => !!state.data.budget_enabled && Number(state.data.balance_kroner) > 0)

// The included part of today, and what went past it onto the balance. One
// number used to cover both, so "95 of 80" read as an error rather than as
// fifteen answers the balance paid for.
const includedToday = computed(() => Math.min(Number(state.data.used_today) || 0, Number(state.data.daily_allowance) || 0))
const beyondToday = computed(() => Math.max(0, (Number(state.data.used_today) || 0) - (Number(state.data.daily_allowance) || 0)))

// A worked example in the customer's own prices: an extra answer costs what one
// costs inside the licence, and "100 more a day" turns a rate of a few øre into
// a monthly figure a manager can hold up against the licence price.
const EXAMPLE_EXTRA_PER_DAY = 100

const priceExample = computed(() => {
    const pricing = state.data.pricing
    if (!pricing?.per_answer_kroner) return ''

    return t('aiUsage.priceExample', {
        perAnswer: kr(pricing.per_answer_kroner, 2),
        seat: kr(pricing.seat_monthly_kroner, 0),
        answers: pricing.answers_per_seat_per_day,
        extra: EXAMPLE_EXTRA_PER_DAY,
        monthly: kr(pricing.per_answer_kroner * EXAMPLE_EXTRA_PER_DAY * 30, 0),
    })
})

const todayShare = computed(() => {
    const allowance = Number(state.data.daily_allowance) || 0
    return allowance > 0 ? includedToday.value / allowance : 0
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

function kr(value: number, digits = 2) {
    return new Intl.NumberFormat(locale.value === 'en' ? 'en-GB' : 'da-DK', {
        style: 'currency',
        currency: 'DKK',
        minimumFractionDigits: digits === 0 ? 0 : undefined,
        maximumFractionDigits: digits,
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

function apply(response: any) {
    state.data = { ...state.data, ...(response?.data ?? response) }
}

async function load() {
    try {
        apply(await aiUsageService.overview())

        // Cody's "buy more" lands here with ?buy=1, so the person who hit the
        // limit goes straight to the purchase instead of hunting for it.
        if (route.query.buy && state.data.topup_app?.uuid) {
            state.buying = true
            router.replace({ query: { ...route.query, buy: undefined } })
        }
    } catch (error: any) {
        state.failed = true
        state.forbidden = error?.status === 403
    } finally {
        state.loading = false
    }
}

onMounted(load)
</script>
