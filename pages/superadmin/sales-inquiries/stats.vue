<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.salesStats.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>{{ $t('superadmin.salesStats.title') }}</template>

            <div class="p-1 max-w-5xl space-y-5">
                <ModulesSuperadminPageHeader :title="$t('superadmin.salesStats.title')" :subtitle="$t('superadmin.salesStats.subtitle')">
                    <template #actions>
                        <NuxtLink to="/superadmin/sales-inquiries"
                            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-white text-ink-body border border-line hover:bg-surface-canvas transition-colors">
                            <Icon name="ph:arrow-left" class="w-4 h-4" /> {{ $t('superadmin.salesStats.back') }}
                        </NuxtLink>
                        <div class="inline-flex rounded-lg border border-line-strong overflow-hidden bg-white" role="group" :aria-label="$t('superadmin.salesStats.period')">
                            <button v-for="d in [30, 90, 365]" :key="d" type="button" :aria-pressed="state.days === d" @click="select(d)" :class="[
                                'px-3 py-1.5 text-[13px] font-medium transition-colors',
                                state.days === d ? 'bg-tertiary text-white' : 'text-ink-body hover:bg-surface-canvas',
                            ]">
                                {{ d === 365 ? $t('superadmin.salesStats.year') : $t('superadmin.salesStats.days', { n: d }) }}
                            </button>
                        </div>
                    </template>
                </ModulesSuperadminPageHeader>

                <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />

                <LoadingSpinner :isActive="state.isLoading">
                    <template v-if="data">
                        <!-- Demos in the period -->
                        <div class="grid grid-cols-2 gap-3 lg:grid-cols-6">
                            <div v-for="tile in tiles" :key="tile.key" class="bg-white border border-line rounded-xl p-4">
                                <p class="text-[12px] font-medium text-ink-muted">{{ $t(`superadmin.salesStats.${tile.key}`) }}</p>
                                <p class="text-[24px] font-bold mt-1 tabular-nums" :class="tile.tone">{{ tile.value }}</p>
                            </div>
                        </div>

                        <!-- Funnel -->
                        <section class="mt-5 bg-white border border-line rounded-xl p-5">
                            <h2 class="text-[15px] font-semibold text-ink">{{ $t('superadmin.salesStats.funnel') }}</h2>
                            <p class="text-[13px] text-ink-muted mt-0.5">{{ $t('superadmin.salesStats.funnelHint') }}</p>
                            <ul class="mt-4 space-y-2.5">
                                <li v-for="step in funnel" :key="step.key" class="grid grid-cols-[9rem_1fr_3.5rem] items-center gap-3 text-[13px]">
                                    <span class="text-ink-body">{{ $t(`superadmin.salesStats.${step.key}`) }}</span>
                                    <span class="h-3 rounded-full bg-surface-canvas overflow-hidden" aria-hidden="true">
                                        <span class="block h-full rounded-full" :class="step.bar" :style="{ width: `${step.width}%` }" />
                                    </span>
                                    <span class="text-right font-semibold text-ink tabular-nums">{{ step.value }}</span>
                                </li>
                            </ul>
                        </section>

                        <!-- Per salesperson -->
                        <section class="mt-5 bg-white border border-line rounded-xl overflow-hidden">
                            <h2 class="px-5 pt-5 pb-3 text-[15px] font-semibold text-ink">{{ $t('superadmin.salesStats.perSeller') }}</h2>
                            <p v-if="!data.hosts.length" class="px-5 pb-6 text-sm text-ink-muted">{{ $t('superadmin.salesStats.none') }}</p>
                            <div v-else class="overflow-x-auto">
                                <table class="w-full text-sm">
                                    <thead class="bg-surface-subtle text-left text-[12px] text-ink-body">
                                        <tr>
                                            <th class="px-5 py-2.5 font-medium">{{ $t('superadmin.salesStats.seller') }}</th>
                                            <th v-for="col in COLUMNS" :key="col" class="px-3 py-2.5 font-medium text-right">{{ $t(`superadmin.salesStats.${col}`) }}</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-line">
                                        <tr v-for="host in data.hosts" :key="host.name">
                                            <td class="px-5 py-2.5 font-medium text-ink">{{ host.name }}</td>
                                            <td class="px-3 py-2.5 text-right tabular-nums">{{ host.total }}</td>
                                            <td class="px-3 py-2.5 text-right tabular-nums">{{ host.held }}</td>
                                            <td class="px-3 py-2.5 text-right tabular-nums">{{ host.missed + host.not_held }}</td>
                                            <td class="px-3 py-2.5 text-right tabular-nums">{{ percent(host.no_show_rate) }}</td>
                                            <td class="px-3 py-2.5 text-right tabular-nums font-semibold">{{ host.won }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </template>
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
/**
 * Superadmin: the sales team's demo figures. How many demos were held or
 * missed, per salesperson, and how far the period's inquiries got. Outcomes
 * come from meetings:sales-follow-up once a demo is over.
 */
import { salesMeetingService } from '@/components/api/superadmin/SalesMeetingService'

const runtimeConfig = useRuntimeConfig()
const COLUMNS = ['demos', 'held', 'missed', 'noShowRate', 'wonAfterDemo']

const state = reactive({ days: 90, isLoading: false, error: {} as any })
const data = ref<any>(null)

const percent = (rate: number | null | undefined) => rate === null || rate === undefined ? '—' : `${Math.round(rate * 100)} %`

const tiles = computed(() => {
    const d = data.value?.demos ?? {}
    return [
        { key: 'demos', value: d.total ?? 0, tone: 'text-ink' },
        { key: 'held', value: d.held ?? 0, tone: 'text-emerald-700' },
        { key: 'missed', value: d.missed ?? 0, tone: 'text-amber-700' },
        { key: 'notHeld', value: d.not_held ?? 0, tone: 'text-ink' },
        { key: 'pending', value: d.pending ?? 0, tone: 'text-ink-muted' },
        { key: 'noShowRate', value: percent(d.no_show_rate), tone: 'text-ink' },
    ]
})

const funnel = computed(() => {
    const f = data.value?.funnel ?? {}
    const top = Math.max(1, f.inquiries ?? 0)
    return [
        { key: 'inquiries', value: f.inquiries ?? 0, bar: 'bg-tertiary' },
        { key: 'demoPlanned', value: f.demo_planned ?? 0, bar: 'bg-tertiary' },
        { key: 'demoHeld', value: f.demo_held ?? 0, bar: 'bg-tertiary' },
        { key: 'won', value: f.won ?? 0, bar: 'bg-emerald-500' },
        { key: 'lost', value: f.lost ?? 0, bar: 'bg-gray-400' },
    ].map((step) => ({ ...step, width: Math.round((step.value / top) * 100) }))
})

async function load() {
    state.isLoading = true
    state.error = {}
    try {
        const response = await salesMeetingService.stats(state.days)
        data.value = response?.data ?? null
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function select(days: number) {
    state.days = days
    load()
}

onMounted(load)
</script>
