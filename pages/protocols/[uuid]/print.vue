<template>
    <div>

        <Head>
            <Title>{{ $t('attendance.participantList') }} – {{ state.protocol?.name ?? '' }}</Title>
        </Head>

        <!-- Screen-only toolbar -->
        <div class="print:hidden bg-white border-b border-[#EAECF0] px-6 py-3 flex items-center justify-between">
            <button @click="router.back()"
                class="flex items-center gap-2 text-sm text-[#5C6478] hover:text-[#1F2533] transition-colors">
                <Icon name="ph:arrow-left" class="w-4 h-4" />
                {{ $t('back') }}
            </button>
            <div class="flex items-center gap-3">
                <!-- Date filter -->
                <div class="flex items-center gap-2">
                    <FormLabel :label="$t('attendance.date')" class="mb-0 text-sm" />
                    <FormDateField id="print_date" name="print_date" :placeholder="$t('attendance.date')"
                        v-model="state.filter.date" />
                </div>
                <FormButton buttonStyle="primary" @click="window.print()">
                    <Icon name="ph:printer" class="w-4 h-4" />
                    {{ $t('attendance.print') }}
                </FormButton>
            </div>
        </div>

        <LoadingSpinner :isActive="state.isLoading" class="print:hidden">
            <div></div>
        </LoadingSpinner>

        <!-- Printable content -->
        <div class="max-w-4xl mx-auto px-6 py-8 print:px-0 print:py-4">
            <!-- Header -->
            <div class="mb-6 print:mb-4">
                <div class="flex items-start justify-between">
                    <div>
                        <h1 class="text-2xl font-bold text-[#1F2533] print:text-xl">
                            {{ state.protocol?.name ?? $t('attendance.participantList') }}
                        </h1>
                        <p class="text-[#5C6478] mt-1 text-sm">
                            {{ $t('attendance.period') }}: {{ formatDateToReadable(state.protocol?.start_date) }} – {{
                                formatDateToReadable(state.protocol?.end_date) }}
                        </p>
                        <p v-if="state.filter.date" class="text-[#5C6478] text-sm">
                            {{ $t('attendance.date') }}: {{ formatDateToReadable(state.filter.date) }}
                        </p>
                    </div>
                    <div class="text-right text-xs text-[#8891A4] print:block hidden">
                        {{ $t('attendance.printedOn') }}: {{ today }}
                    </div>
                </div>

                <!-- Summary row -->
                <div class="flex items-center gap-4 mt-4 text-sm" v-if="state.rows.length">
                    <span class="font-medium text-[#1F2533]">
                        {{ $t('attendance.total') }}: {{ state.rows.length }}
                    </span>
                    <span class="text-[#2E9E33]">
                        ✓ {{ attendedCount }} ({{ attendedPct }}%)
                    </span>
                    <span class="text-[#CC3B2D]">
                        ✗ {{ absentCount }} ({{ absentPct }}%)
                    </span>
                    <span class="text-[#8891A4]">
                        — {{ pendingCount }} {{ $t('attendance.notRegistered') }}
                    </span>
                </div>
            </div>

            <!-- Table -->
            <table class="w-full border-collapse text-sm">
                <thead>
                    <tr class="border-b-2 border-[#1F2533]">
                        <th class="text-left py-2 pr-4 font-semibold text-[#1F2533]">#</th>
                        <th class="text-left py-2 pr-4 font-semibold text-[#1F2533]">
                            {{ $t('attendance.citizen') }}
                        </th>
                        <th class="text-left py-2 pr-4 font-semibold text-[#1F2533]">
                            {{ $t('protocols.table.status.attended') }} / {{ $t('protocols.table.status.absent') }}
                        </th>
                        <th class="text-left py-2 font-semibold text-[#1F2533]">
                            {{ $t('attendance.absenceReason') }}
                        </th>
                        <th class="text-left py-2 print:table-cell hidden font-semibold text-[#1F2533]">
                            {{ $t('attendance.signature') }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, i) in state.rows" :key="row.uuid" class="border-b border-[#EAECF0]"
                        :class="i % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB] print:bg-white'">
                        <td class="py-3 pr-4 text-[#8891A4]">{{ i + 1 }}</td>
                        <td class="py-3 pr-4 font-medium text-[#1F2533]">
                            {{ participantName(row) }}
                        </td>
                        <td class="py-3 pr-4">
                            <span v-if="row.status === 'attended'"
                                class="text-[#2E9E33] font-semibold print:text-black">
                                ✓ {{ $t('protocols.table.status.attended') }}
                            </span>
                            <span v-else-if="row.status === 'absent'"
                                class="text-[#CC3B2D] font-semibold print:text-black">
                                ✗ {{ $t('protocols.table.status.absent') }}
                            </span>
                            <span v-else class="text-[#8891A4]">—</span>
                        </td>
                        <td class="py-3 text-[#5C6478]">
                            {{ row.absence?.name ?? '—' }}
                        </td>
                        <td class="py-3 print:table-cell hidden">
                            <!-- signature line -->
                            <div class="border-b border-[#8891A4] w-24 mt-4"></div>
                        </td>
                    </tr>
                    <!-- Empty fill rows for printing -->
                    <template v-if="state.rows.length < 20">
                        <tr v-for="n in (20 - state.rows.length)" :key="`empty-${n}`"
                            class="border-b border-[#EAECF0] print:table-row hidden">
                            <td class="py-3 pr-4 text-[#8891A4]">{{ state.rows.length + n }}</td>
                            <td class="py-3 pr-4"></td>
                            <td class="py-3 pr-4"></td>
                            <td class="py-3"></td>
                            <td class="py-3">
                                <div class="border-b border-[#8891A4] w-24 mt-4"></div>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>

            <div v-if="!state.rows.length && !state.isLoading"
                class="text-center py-10 text-[#8891A4] text-sm print:hidden">
                {{ $t('attendance.noParticipantsToday') }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { protocolService } from '@/components/api/user/ProtocolService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

definePageMeta({ layout: false })

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const { formatDateToReadable } = useDatetimeFormatter()
const protocolUuid = route.params.uuid as string
const today = moment().format('D. MMMM YYYY')
const window = process.client ? globalThis : null as any

const participantName = (p: any) =>
    `${p?.citizen?.firstname ?? p?.firstname ?? ''} ${p?.citizen?.lastname ?? p?.lastname ?? ''}`.trim() || '—'

const state = reactive({
    error: {} as Error,
    isLoading: false,
    protocol: null as any,
    rows: [] as any[],
    filter: { date: moment().format('YYYY-MM-DD') },
})

const attendedCount = computed(() => state.rows.filter(r => r.status === 'attended').length)
const absentCount = computed(() => state.rows.filter(r => r.status === 'absent').length)
const pendingCount = computed(() => state.rows.filter(r => !r.status).length)
const attendedPct = computed(() =>
    state.rows.length ? Math.round((attendedCount.value / state.rows.length) * 100) : 0
)
const absentPct = computed(() =>
    state.rows.length ? Math.round((absentCount.value / state.rows.length) * 100) : 0
)

watch(() => state.filter.date, () => fetchParticipants())

onMounted(() => {
    fetchProtocol()
    fetchParticipants()
})

async function fetchProtocol() {
    try {
        const r = await protocolService.getProtocol(protocolUuid)
        state.protocol = r?.data ?? r
    } catch { /* silent */ }
}

async function fetchParticipants() {
    state.isLoading = true
    try {
        const params: any = { page_limit: 'all' }
        if (state.filter.date) params.date = state.filter.date
        const r = await protocolService.getCitizenProtocols(protocolUuid, params)
        state.rows = r?.data ?? r ?? []
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}
</script>

<style>
@media print {
    body {
        font-size: 12px;
    }

    .print\:hidden {
        display: none !important;
    }

    .print\:table-cell {
        display: table-cell !important;
    }

    .print\:table-row {
        display: table-row !important;
    }
}
</style>
