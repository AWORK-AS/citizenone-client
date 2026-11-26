<script setup lang="ts">
import { computed, onMounted, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { fMKService } from '@/components/api/user/FMKService'

/**
 * Who may use FMK: one licence per staff member, from the seats the company
 * bought. Taking a licence away also ends that staff member's FMK login.
 */
interface StaffRow { uuid: string, name: string, email: string | null, has_licence: boolean }
interface LicenceState { total: number, used: number, staff: StaffRow[] }

const { t } = useI18n()
const state = shallowRef<LicenceState | null>(null)
const busy = shallowRef<string | null>(null)
const error = shallowRef<string | null>(null)
const search = shallowRef('')

const free = computed(() => (state.value ? state.value.total - state.value.used : 0))
const rows = computed(() => {
    const q = search.value.trim().toLowerCase()
    const list = state.value?.staff ?? []
    return q ? list.filter(s => s.name.toLowerCase().includes(q) || (s.email ?? '').toLowerCase().includes(q)) : list
})

async function load() {
    try {
        const response = await fMKService.getLicences()
        state.value = (response?.data ?? response) as LicenceState
    } catch (cause: any) {
        error.value = cause?.message ?? String(cause)
    }
}

async function toggle(row: StaffRow) {
    busy.value = row.uuid
    error.value = null
    try {
        const response = row.has_licence ? await fMKService.releaseLicence(row.uuid) : await fMKService.assignLicence(row.uuid)
        state.value = (response?.data ?? response) as LicenceState
    } catch (cause: any) {
        error.value = cause?.message ?? String(cause)
    } finally {
        busy.value = null
    }
}

onMounted(load)
</script>

<template>
    <section class="space-y-4 rounded-xl border border-[#e2e8f0] bg-white p-5" :aria-label="$t('settings.fmk.licences.title')">
        <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
                <h2 class="font-semibold text-[#1a2332]">{{ $t('settings.fmk.licences.title') }}</h2>
                <p class="mt-1 text-sm text-[#64748b]">{{ $t('settings.fmk.licences.hint') }}</p>
            </div>
            <div v-if="state" class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p class="text-sm font-semibold text-[#1a2332]" aria-live="polite">{{ $t('settings.fmk.licences.used', { used: state.used, total: state.total }) }}</p>
                <NuxtLink to="/apps/fmk" class="text-xs font-semibold text-[#0f4c75] hover:text-[#1b6d8a]">{{ $t('settings.fmk.licences.buyMore') }}</NuxtLink>
            </div>
        </div>

        <p v-if="error" role="alert" class="rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm text-[#991b1b]">{{ error }}</p>
        <p v-if="state && free === 0 && state.total > 0" class="rounded-lg border border-[#fed7aa] bg-[#fff7ed] px-3 py-2 text-sm text-[#c2410c]">{{ $t('settings.fmk.licences.noneFree') }}</p>

        <label class="block">
            <span class="sr-only">{{ $t('settings.fmk.licences.search') }}</span>
            <input v-model="search" type="search" :placeholder="$t('settings.fmk.licences.search')"
                class="h-10 w-full rounded-lg border border-[#e2e8f0] px-3 text-sm text-[#1a2332] focus:border-[#2dbab2] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2dbab2]/40" />
        </label>

        <ul class="divide-y divide-[#e2e8f0]">
            <li v-for="row in rows" :key="row.uuid" class="flex items-center justify-between gap-3 py-2.5">
                <div class="min-w-0">
                    <p class="truncate text-sm font-semibold text-[#1a2332]">{{ row.name }}</p>
                    <p v-if="row.email" class="truncate text-xs text-[#64748b]">{{ row.email }}</p>
                </div>
                <button type="button" role="switch" :aria-checked="row.has_licence" :disabled="busy === row.uuid || (!row.has_licence && free === 0)"
                    :aria-label="t('settings.fmk.licences.toggle', { name: row.name })"
                    class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2dbab2] disabled:cursor-not-allowed disabled:opacity-50"
                    :class="row.has_licence ? 'bg-[#2dbab2]' : 'bg-[#e2e8f0]'" @click="toggle(row)">
                    <span class="inline-block size-5 transform rounded-full bg-white shadow transition-transform"
                        :class="row.has_licence ? 'translate-x-5' : 'translate-x-0.5'" />
                </button>
            </li>
            <li v-if="rows.length === 0" class="py-4 text-center text-sm text-[#64748b]">{{ $t('settings.fmk.licences.noStaff') }}</li>
        </ul>
    </section>
</template>
