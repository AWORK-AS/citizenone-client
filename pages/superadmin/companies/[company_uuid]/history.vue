<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.companyHistory.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.companyHistory.title') }}</template>

            <div class="p-1">
                <ModulesSuperadminCompanyHeader />

                <!-- Filter chips: one per kind of event the colleague may see. -->
                <div v-if="state.available.length" class="flex flex-wrap items-center gap-2 mb-6"
                    role="group" :aria-label="$t('superadmin.companyHistory.filterLabel')">
                    <button type="button" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors"
                        :class="!state.selected.length ? CHIP_ON : CHIP_OFF" :aria-pressed="!state.selected.length"
                        @click="setTypes([])">
                        {{ $t('superadmin.companyHistory.all') }}
                    </button>
                    <button v-for="type in state.available" :key="type" type="button"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors"
                        :class="state.selected.includes(type) ? CHIP_ON : CHIP_OFF" :aria-pressed="state.selected.includes(type)"
                        @click="setTypes(toggleType(state.selected, type))">
                        <Icon :name="eventIcon(type)" class="w-3.5 h-3.5" aria-hidden="true" />
                        {{ $t(`superadmin.companyHistory.types.${type}`) }}
                    </button>
                </div>

                <Alert v-if="state.error" type="danger" :text="state.error" />

                <!-- First load -->
                <div v-if="state.isLoading && !state.events.length" class="space-y-3" aria-hidden="true">
                    <div v-for="n in 5" :key="n" class="h-16 rounded-xl bg-white border border-surface-200 animate-pulse" />
                </div>

                <div v-else-if="!state.events.length && !state.error"
                    class="bg-white rounded-xl border border-surface-200 p-10 text-center">
                    <Icon name="ph:clock-counter-clockwise" class="w-8 h-8 text-gray-300 mx-auto" aria-hidden="true" />
                    <p class="mt-3 text-sm text-gray-500">{{ $t('superadmin.companyHistory.empty') }}</p>
                </div>

                <div v-else class="space-y-8">
                    <section v-for="group in groups" :key="group.key" :aria-labelledby="`month-${group.key}`">
                        <h2 :id="`month-${group.key}`" class="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                            {{ monthLabel(group.year, group.month) }}
                        </h2>

                        <ol class="relative bg-white rounded-xl border border-surface-200 py-2">
                            <li v-for="(event, index) in group.events" :key="event.id" class="relative flex gap-4 px-5 py-3">
                                <!-- The line between dots -->
                                <span v-if="index < group.events.length - 1"
                                    class="absolute left-9 top-11 bottom-0 w-px bg-surface-200" aria-hidden="true" />

                                <span class="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border"
                                    :class="TONE_CLASSES[eventTone(event.kind)].pill">
                                    <Icon :name="eventIcon(event.type)" class="w-4 h-4" aria-hidden="true" />
                                </span>

                                <div class="min-w-0 flex-1">
                                    <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                                        <p class="text-sm font-semibold text-gray-900">{{ titleOf(event) }}</p>
                                        <span v-if="event.amount !== null" class="text-sm font-semibold text-gray-900 tabular-nums">
                                            {{ formatAmount(event.amount, 'DKK') }}
                                        </span>
                                    </div>
                                    <p v-if="event.detail" class="mt-0.5 text-sm text-gray-600 break-words">{{ event.detail }}</p>
                                    <p class="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-gray-500">
                                        <time :datetime="event.occurred_at">{{ formatMoment(event.occurred_at) }}</time>
                                        <template v-if="event.params?.number">
                                            <span aria-hidden="true">·</span>
                                            <span>{{ $t('superadmin.companyHistory.number', { number: event.params.number }) }}</span>
                                        </template>
                                        <template v-if="event.actor">
                                            <span aria-hidden="true">·</span>
                                            <span>{{ event.actor.name }}<span v-if="event.actor.is_staff"> ({{ $t('superadmin.companyHistory.staff') }})</span></span>
                                        </template>
                                        <template v-if="event.link">
                                            <span aria-hidden="true">·</span>
                                            <NuxtLink :to="event.link" class="text-primary font-semibold hover:underline">
                                                {{ $t('superadmin.companyHistory.open') }}
                                            </NuxtLink>
                                        </template>
                                    </p>
                                </div>
                            </li>
                        </ol>
                    </section>

                    <div v-if="state.nextBefore" class="flex justify-center">
                        <FormButton buttonStyle="action" :disabled="state.isLoading" @click="loadMore">
                            <Icon v-if="state.isLoading" name="ph:spinner" class="w-4 h-4 animate-spin" aria-hidden="true" />
                            {{ $t('superadmin.companyHistory.showMore') }}
                        </FormButton>
                    </div>
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { companyHistoryService } from '@/components/api/superadmin/CompanyHistoryService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import {
    appendEvents,
    eventIcon,
    eventParams,
    eventTone,
    groupEventsByMonth,
    toggleType,
    typesQuery,
    TONE_CLASSES,
    type TimelineEvent,
    type TimelineType,
} from '@/composables/superadminCompany'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const { t, te, locale } = useI18n()
const { formatAmount } = useAmountFormatter()

const companyUuid = String(route.params.company_uuid ?? '')
const timeZone = 'Europe/Copenhagen'

const CHIP_ON = 'bg-primary-50 border-primary-200 text-primary'
const CHIP_OFF = 'bg-white border-surface-200 text-gray-600 hover:text-gray-900 hover:border-gray-300'

const state = reactive({
    events: [] as TimelineEvent[],
    available: [] as TimelineType[],
    selected: [] as TimelineType[],
    nextBefore: null as string | null,
    isLoading: false,
    error: '',
})

const groups = computed(() => groupEventsByMonth(state.events, timeZone))

// Each request knows which filter it was made for; an answer for an old
// filter that arrives late is dropped.
let generation = 0

async function load(reset: boolean) {
    const mine = reset ? ++generation : generation
    state.isLoading = true
    state.error = ''

    const params: { before?: string; types?: string } = {}
    const types = typesQuery(state.selected, state.available.length ? state.available : state.selected)
    if (types) params.types = types
    if (!reset && state.nextBefore) params.before = state.nextBefore

    try {
        const response = await companyHistoryService.getTimeline(companyUuid, params)
        if (mine !== generation) return

        const page: TimelineEvent[] = response?.data ?? []
        state.events = reset ? page : appendEvents(state.events, page)
        state.nextBefore = response?.meta?.next_before ?? null
        if (Array.isArray(response?.meta?.types)) state.available = response.meta.types
    } catch (error: any) {
        if (mine !== generation) return
        state.error = error?.message || t('superadmin.companyHistory.loadFailed')
    } finally {
        if (mine === generation) state.isLoading = false
    }
}

function setTypes(types: TimelineType[]) {
    state.selected = types
    state.nextBefore = null
    load(true)
}

function loadMore() {
    if (state.nextBefore && !state.isLoading) load(false)
}

/** Params that are themselves words (a billing method) or dates are translated first. */
function titleOf(event: TimelineEvent): string {
    const key = `superadmin.companyHistory.kinds.${event.kind}`
    if (!te(key)) return event.title

    const params: Record<string, string | number> = eventParams(event)
    for (const field of ['from', 'to'] as const) {
        const value = params[field]
        if (event.kind === 'billing_method_changed' && typeof value === 'string') {
            params[field] = t(`superadmin.companyHeader.billingMethod.${value}`)
        }
    }
    for (const field of ['until', 'ends_on', 'date'] as const) {
        if (typeof params[field] === 'string') params[field] = formatDay(params[field] as string)
    }
    if (typeof params.economic === 'string' && te(`superadmin.companyHistory.economic.${params.economic}`)) {
        params.economic = t(`superadmin.companyHistory.economic.${params.economic}`)
    }

    return t(key, params)
}

const dateLocale = computed(() => (locale.value === 'en' ? 'en-GB' : locale.value === 'no' ? 'nb-NO' : locale.value === 'sv' ? 'sv-SE' : 'da-DK'))

function monthLabel(year: number, month: number) {
    const label = new Date(year, month - 1, 15).toLocaleDateString(dateLocale.value, { month: 'long', year: 'numeric' })

    return label.charAt(0).toUpperCase() + label.slice(1)
}

function formatMoment(value: string) {
    return new Date(value).toLocaleString(dateLocale.value, { timeZone, day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function formatDay(value: string) {
    const date = new Date(value.length === 10 ? `${value}T12:00:00` : value)

    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(dateLocale.value, { day: 'numeric', month: 'short', year: 'numeric' })
}

onMounted(() => load(true))
</script>
