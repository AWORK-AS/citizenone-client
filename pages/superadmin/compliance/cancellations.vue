<template>
    <div>
        <NuxtLayout name="superadmin">
            <template #header>
                {{ $t('superadmin.cancellations.pageTitle') }}
            </template>

            <div class="p-7 max-w-[1320px]">

                <!-- Header -->
                <div class="flex items-end justify-between mb-6">
                    <div>
                        <h1 class="text-[22px] font-semibold text-[#1F2533]">
                            {{ $t('superadmin.cancellations.pageTitle') }}
                        </h1>
                        <p class="text-sm text-[#5C6478] mt-1">
                            {{ $t('superadmin.cancellations.pageSubtitle') }}
                        </p>
                    </div>
                    <button @click="openModal()"
                        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm"
                        style="background:#CC3B2D">
                        <Icon name="ph:plus" class="w-4 h-4" />
                        {{ $t('superadmin.cancellations.registerBtn') }}
                    </button>
                </div>

                <div class="grid grid-cols-4 gap-4 mb-6">
                    <div class="bg-white border border-[#EAECF0] rounded-xl p-4 shadow-sm">
                        <div class="text-[10px] font-semibold text-[#8891A4] uppercase tracking-[.06em] mb-1">
                            {{ $t('superadmin.cancellations.statTotal') }}
                        </div>
                        <div class="text-[24px] font-semibold text-[#1F2533]">
                            {{ cancellations.length }}
                        </div>
                        <div class="text-[11px] text-[#8891A4] mt-0.5">
                            {{ $t('superadmin.cancellations.statSinceLaunch') }}
                        </div>
                    </div>
                    <div class="bg-white border border-[#EAECF0] rounded-xl p-4 shadow-sm">
                        <div class="text-[10px] font-semibold text-[#8891A4] uppercase tracking-[.06em] mb-1">
                            {{ $t('superadmin.cancellations.statThisMonth') }}
                        </div>
                        <div class="text-[24px] font-semibold text-[#CC3B2D]">
                            {{ thisMonthCount }}
                        </div>
                        <div class="text-[11px] text-[#8891A4] mt-0.5">
                            {{ $t('superadmin.cancellations.statNewCancellations') }}
                        </div>
                    </div>
                    <div class="bg-white border border-[#EAECF0] rounded-xl p-4 shadow-sm">
                        <div class="text-[10px] font-semibold text-[#8891A4] uppercase tracking-[.06em] mb-1">
                            {{ $t('superadmin.cancellations.statLostMRR') }}
                        </div>
                        <div class="text-[24px] font-semibold text-[#CC3B2D]">
                            {{ fmt(lostMRR) }}
                        </div>
                        <div class="text-[11px] text-[#8891A4] mt-0.5">
                            {{ $t('superadmin.cancellations.statThisMonth') }}
                        </div>
                    </div>
                    <div class="bg-white border border-[#EAECF0] rounded-xl p-4 shadow-sm">
                        <div class="text-[10px] font-semibold text-[#8891A4] uppercase tracking-[.06em] mb-1">
                            {{ $t('superadmin.cancellations.statPrimaryReason') }}
                        </div>
                        <div class="text-[16px] font-semibold text-[#1F2533] truncate">
                            {{ topReason }}
                        </div>
                        <div class="text-[11px] text-[#8891A4] mt-0.5">
                            {{ $t('superadmin.cancellations.statMostCommon') }}
                        </div>
                    </div>
                </div>

                <div class="flex items-center gap-3 mb-4">
                    <SuperadminTableSearch v-model="search"
                        :placeholder="$t('superadmin.cancellations.searchPlaceholder')" />
                    <select v-model="reasonFilter"
                        class="bg-white border border-[#D5D9E2] rounded-lg px-3 py-2 text-sm text-[#5C6478] outline-none">
                        <option value="">
                            {{ $t('superadmin.cancellations.allReasons') }}
                        </option>
                        <option v-for="r in cancelReasons" :key="r.key" :value="r.key">
                            {{ r.label }}
                        </option>
                    </select>
                    <select v-model="periodFilter"
                        class="bg-white border border-[#D5D9E2] rounded-lg px-3 py-2 text-sm text-[#5C6478] outline-none">
                        <option value="">{{ $t('superadmin.cancellations.allPeriods') }}</option>
                        <option value="this_month">{{ $t('superadmin.cancellations.thisMonth') }}</option>
                        <option value="last_month">{{ $t('superadmin.cancellations.lastMonth') }}</option>
                        <option value="this_year">{{ $t('superadmin.cancellations.thisYear') }}</option>
                    </select>
                </div>

                <SuperadminTable :columnHeaders="state.columnHeaders" :data="cancellationsTableData"
                    :isLoading="loading" :emptyMessage="$t('superadmin.cancellations.emptyTitle')"
                    :emptySubMessage="$t('superadmin.cancellations.emptyDesc')" emptyIcon="ph:x-circle" rowKey="id">
                    <template #body>
                        <tr v-for="cancellation in filteredCancellations" :key="cancellation.id ?? cancellation.uuid"
                            class="border-b border-[#F5F6F8] hover:bg-[#F9FAFB] transition-colors group">
                            <td class="co-td">
                                <div class="flex items-center gap-2.5">
                                    <div class="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                                        :style="`background:${avatarColor(cancellation.company_name ?? cancellation.company?.name ?? '?')}`">
                                        {{ (cancellation.company_name ?? cancellation.company?.name ??
                                            '?').charAt(0).toUpperCase() }}
                                    </div>
                                    <span class="text-[13px] font-medium text-[#1F2533]">
                                        {{ cancellation.company_name ?? cancellation.company?.name ?? '—' }}
                                    </span>
                                </div>
                            </td>
                            <td class="co-td text-[13px] text-[#5C6478]">
                                {{ cancellation.product_name ?? cancellation.license?.product?.name ?? '—' }}
                            </td>
                            <td class="co-td">
                                <span
                                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
                                    :style="reasonStyle(cancellation.reason)">
                                    <Icon :name="reasonIcon(cancellation.reason)" class="w-3 h-3" />
                                    {{ reasonLabel(cancellation.reason) }}
                                </span>
                            </td>
                            <td class="co-td text-[13px] font-medium text-[#CC3B2D]">
                                {{ cancellation.mrr_lost ? fmt(cancellation.mrr_lost) : '—' }}
                            </td>
                            <td class="co-td text-[13px] text-[#5C6478]">
                                {{ formatDate(cancellation.cancelled_at) }}
                            </td>
                            <td class="co-td text-[12px] text-[#8891A4] max-w-[200px] truncate">
                                {{ cancellation.notes || '—' }}
                            </td>
                            <td class="co-td" @click.stop>
                                <div
                                    class="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                    <SuperadminTableButton @click="openModal(cancellation)">
                                        <Icon name="ph:pencil-simple" class="w-3.5 h-3.5" />
                                    </SuperadminTableButton>
                                </div>
                            </td>
                        </tr>
                    </template>
                </SuperadminTable>

                <!-- Reason breakdown -->
                <div v-if="cancellations.length > 0"
                    class="mt-6 bg-white border border-[#EAECF0] rounded-xl p-5 shadow-sm">
                    <h3 class="text-[13px] font-semibold text-[#1F2533] mb-4">
                        {{ $t('superadmin.cancellations.reasonBreakdown') }}
                    </h3>
                    <div class="space-y-3">
                        <div v-for="reason in reasonDistribution" :key="reason.key">
                            <div class="flex justify-between text-[12px] mb-1">
                                <span class="text-[#5C6478] flex items-center gap-1.5">
                                    <Icon :name="reasonIcon(reason.key)" class="w-3.5 h-3.5" />
                                    {{ reason.label }}
                                </span>
                                <span class="font-medium text-[#1F2533]">{{ reason.count }} ({{ reason.pct }}%)</span>
                            </div>
                            <div class="h-2 bg-[#EAECF0] rounded-full overflow-hidden">
                                <div class="h-full rounded-full bg-[#CC3B2D] transition-all"
                                    :style="`width:${reason.pct}%;opacity:${0.4 + reason.pct / 100}`" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal: Register / Edit cancellation -->
            <div v-if="modal.open" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
                @click.self="modal.open = false">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-[500px] overflow-hidden">
                    <!-- Header -->
                    <div class="px-6 py-5 border-b border-[#EAECF0]">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                                <Icon name="ph:x-circle" class="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <h3 class="text-[15px] font-semibold text-[#1F2533]">
                                    {{
                                        modal.editing
                                            ? $t('superadmin.cancellations.modalEditTitle')
                                            : $t('superadmin.cancellations.modalNewTitle')
                                    }}
                                </h3>
                                <p class="text-[12px] text-[#8891A4] mt-0.5">
                                    {{ $t('superadmin.cancellations.modalSubtitle') }}
                                </p>
                            </div>
                        </div>
                    </div>
                    <!-- Body -->
                    <div class="px-6 py-5 space-y-4">
                        <div>
                            <label class="co-label">
                                {{ $t('superadmin.cancellations.labelCompany') }}
                                <span class="text-red-500">*</span>
                            </label>
                            <input v-model="modal.form.company_name" type="text"
                                :placeholder="$t('superadmin.cancellations.phCompany')" class="co-input mt-1" />
                        </div>
                        <div>
                            <label class="co-label">
                                {{ $t('superadmin.cancellations.labelProduct') }}
                            </label>
                            <input v-model="modal.form.product_name" type="text"
                                :placeholder="$t('superadmin.cancellations.phProduct')" class="co-input mt-1" />
                        </div>
                        <div>
                            <label class="co-label">
                                {{ $t('superadmin.cancellations.labelReason') }}
                                <span class="text-red-500">*</span>
                            </label>
                            <div class="grid grid-cols-2 gap-2 mt-1">
                                <button v-for="r in cancelReasons" :key="r.key"
                                    class="py-2.5 px-3 rounded-xl border-2 text-[12px] font-medium text-left transition-colors flex items-center gap-2"
                                    :style="modal.form.reason === r.key
                                        ? 'border-color:#CC3B2D;background:#FFF0F0;color:#CC3B2D'
                                        : 'border-color:#EAECF0;color:#5C6478'" @click="modal.form.reason = r.key">
                                    <Icon :name="r.icon" class="w-3.5 h-3.5 flex-shrink-0" />
                                    {{ r.label }}
                                </button>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="co-label">
                                    {{ $t('superadmin.cancellations.labelMrrLost') }}
                                </label>
                                <input v-model.number="modal.form.mrr_lost" type="number" placeholder="0"
                                    class="co-input mt-1" />
                            </div>
                            <div>
                                <label class="co-label">
                                    {{ $t('superadmin.cancellations.labelDate') }}
                                </label>
                                <input v-model="modal.form.cancelled_at" type="date" class="co-input mt-1" />
                            </div>
                        </div>
                        <div>
                            <label class="co-label">
                                {{ $t('superadmin.cancellations.labelNotes') }}
                            </label>
                            <textarea v-model="modal.form.notes" rows="2"
                                :placeholder="$t('superadmin.cancellations.phNotes')"
                                class="co-input resize-none mt-1"></textarea>
                        </div>
                    </div>
                    <!-- Footer -->
                    <div class="flex items-center gap-3 px-6 py-4 border-t border-[#EAECF0]">
                        <button @click="modal.open = false"
                            class="flex-1 py-2.5 rounded-lg text-sm font-medium text-[#5C6478] border border-[#EAECF0] hover:bg-[#F5F6F8]">
                            {{ $t('superadmin.cancellations.cancel') }}
                        </button>
                        <button @click="saveCancellation"
                            :disabled="!modal.form.company_name || !modal.form.reason || modal.saving"
                            class="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors">
                            <span v-if="modal.saving" class="flex items-center justify-center gap-2">
                                <Icon name="ph:spinner" class="w-4 h-4 animate-spin" />
                                {{ $t('superadmin.cancellations.saving') }}
                            </span>
                            <span v-else>
                                {{
                                    modal.editing
                                        ? $t('superadmin.cancellations.saveChanges')
                                        : $t('superadmin.cancellations.register')
                                }}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const loading = ref(false)
const search = ref('')
const reasonFilter = ref('')
const periodFilter = ref('')

// Locale-reactive cancel reasons
const cancelReasons = computed(() => [
    { key: 'price', label: t('superadmin.cancellations.reasonPrice'), icon: 'ph:currency-circle-dollar' },
    { key: 'features', label: t('superadmin.cancellations.reasonFeatures'), icon: 'ph:puzzle-piece' },
    { key: 'competitor', label: t('superadmin.cancellations.reasonCompetitor'), icon: 'ph:arrows-left-right' },
    { key: 'closed', label: t('superadmin.cancellations.reasonClosed'), icon: 'ph:building' },
    { key: 'trial_end', label: t('superadmin.cancellations.reasonTrialEnd'), icon: 'ph:timer' },
    { key: 'other', label: t('superadmin.cancellations.reasonOther'), icon: 'ph:dots-three' },
])

const cancellations = ref<any[]>([])

const modal = reactive({
    open: false,
    editing: false,
    editId: null as any,
    saving: false,
    form: {
        company_name: '',
        product_name: '',
        reason: '',
        mrr_lost: null as number | null,
        cancelled_at: new Date().toISOString().split('T')[0],
        notes: '',
    }
})

// ── Computed ──────────────────────────────────────────────────────────────
const thisMonth = new Date().toISOString().slice(0, 7)

const thisMonthCount = computed(() =>
    cancellations.value.filter(c => c.cancelled_at?.startsWith(thisMonth)).length
)

const lostMRR = computed(() =>
    cancellations.value
        .filter(c => c.cancelled_at?.startsWith(thisMonth))
        .reduce((s, c) => s + (Number(c.mrr_lost) || 0), 0)
)

const topReason = computed(() => {
    const counts: Record<string, number> = {}
    cancellations.value.forEach(c => { counts[c.reason] = (counts[c.reason] || 0) + 1 })
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
    return top ? cancelReasons.value.find(r => r.key === top[0])?.label ?? top[0] : '—'
})

const reasonDistribution = computed(() => {
    const total = cancellations.value.length || 1
    const counts: Record<string, number> = {}
    cancellations.value.forEach(c => { counts[c.reason || 'other'] = (counts[c.reason || 'other'] || 0) + 1 })
    return Object.entries(counts)
        .map(([key, count]) => ({
            key,
            label: cancelReasons.value.find(r => r.key === key)?.label ?? key,
            count,
            pct: Math.round(count / total * 100)
        }))
        .sort((a, b) => b.count - a.count)
})

const state = reactive({
    columnHeaders: computed(() => [
        { key: 'company', name: t('superadmin.cancellations.colCompany') },
        { key: 'product', name: t('superadmin.cancellations.colProduct') },
        { key: 'reason', name: t('superadmin.cancellations.colReason') },
        { key: 'mrr_lost', name: t('superadmin.cancellations.colMrrLost') },
        { key: 'cancelled_at', name: t('superadmin.cancellations.colDate') },
        { key: 'notes', name: t('superadmin.cancellations.colNotes') },
        { key: 'actions', name: '' },
    ]),
})

const filteredCancellations = computed(() => {
    let list = cancellations.value
    if (search.value) {
        const q = search.value.toLowerCase()
        list = list.filter(c => (c.company_name ?? c.company?.name ?? '').toLowerCase().includes(q))
    }
    if (reasonFilter.value) list = list.filter(c => c.reason === reasonFilter.value)
    if (periodFilter.value === 'this_month') list = list.filter(c => c.cancelled_at?.startsWith(thisMonth))
    if (periodFilter.value === 'last_month') {
        const d = new Date(); d.setMonth(d.getMonth() - 1)
        const m = d.toISOString().slice(0, 7)
        list = list.filter(c => c.cancelled_at?.startsWith(m))
    }
    if (periodFilter.value === 'this_year') {
        const y = new Date().getFullYear().toString()
        list = list.filter(c => c.cancelled_at?.startsWith(y))
    }
    return list
})

const cancellationsTableData = computed(() => ({ data: filteredCancellations.value }))

// ── Helpers ───────────────────────────────────────────────────────────────
const COLORS = [['#EEF4FB', '#003080'], ['#EEF8F8', '#22706A'], ['#EAF3DE', '#3B6D11'], ['#FAEEDA', '#633806']]
const avatarColor = (n: string) => COLORS[(n?.charCodeAt(0) ?? 0) % COLORS.length][1]

function fmt(v: number) {
    return new Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v || 0)
}

function formatDate(d: string) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('da-DK', { day: 'numeric', month: 'short', year: 'numeric' })
}

function reasonLabel(key: string) {
    return cancelReasons.value.find(r => r.key === key)?.label ?? key ?? '—'
}

function reasonIcon(key: string) {
    return cancelReasons.value.find(r => r.key === key)?.icon ?? 'ph:question'
}

function reasonStyle(key: string) {
    const map: Record<string, string> = {
        price: 'background:#FFF0F0;color:#CC3B2D',
        features: 'background:#FFF9EC;color:#D4900A',
        competitor: 'background:#F0F4FF;color:#3357CC',
        closed: 'background:#F5F6F8;color:#5C6478',
        trial_end: 'background:#EEF8F8;color:#22706A',
        other: 'background:#F5F6F8;color:#8891A4',
    }
    return map[key] ?? 'background:#F5F6F8;color:#8891A4'
}

// ── Modal ─────────────────────────────────────────────────────────────────
function openModal(existing?: any) {
    modal.editing = !!existing
    modal.editId = existing?.id ?? existing?.uuid ?? null
    modal.form = {
        company_name: existing?.company_name ?? existing?.company?.name ?? '',
        product_name: existing?.product_name ?? existing?.license?.product?.name ?? '',
        reason: existing?.reason ?? '',
        mrr_lost: existing?.mrr_lost ?? null,
        cancelled_at: existing?.cancelled_at ?? new Date().toISOString().split('T')[0],
        notes: existing?.notes ?? '',
    }
    modal.open = true
}

async function saveCancellation() {
    if (!modal.form.company_name || !modal.form.reason) return
    modal.saving = true
    try {
        const runtimeConfig = useRuntimeConfig()
        const url = modal.editing
            ? `${runtimeConfig.public.apiBaseURL}/superadmin/cancellations/${modal.editId}`
            : `${runtimeConfig.public.apiBaseURL}/superadmin/cancellations`

        await $fetch(url, {
            method: modal.editing ? 'PUT' : 'POST',
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('_token'),
                Accept: 'application/json',
            },
            body: modal.form,
        })

        modal.open = false
        await fetchCancellations()
    } catch {
        // Fallback: save locally if API not available yet
        if (modal.editing) {
            const idx = cancellations.value.findIndex(c => (c.id ?? c.uuid) === modal.editId)
            if (idx >= 0) cancellations.value[idx] = { ...cancellations.value[idx], ...modal.form }
        } else {
            cancellations.value.unshift({ id: Date.now(), ...modal.form })
        }
        modal.open = false
    }
    modal.saving = false
}

// ── Data ──────────────────────────────────────────────────────────────────
async function fetchCancellations() {
    loading.value = true
    try {
        const runtimeConfig = useRuntimeConfig()
        const res = await $fetch<any>(`${runtimeConfig.public.apiBaseURL}/superadmin/cancellations`, {
            headers: {
                Authorization: 'Bearer ' + localStorage.getItem('_token'),
                Accept: 'application/json',
            },
        })
        cancellations.value = Array.isArray(res?.data ?? res) ? (res?.data ?? res) : []
    } catch {
        cancellations.value = []
    }
    loading.value = false
}

onMounted(() =>
    fetchCancellations()
)
</script>
