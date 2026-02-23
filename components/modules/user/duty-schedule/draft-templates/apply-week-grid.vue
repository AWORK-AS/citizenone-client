<template>
    <div class="p-5 font-sans text-slate-900 bg-slate-100 min-h-screen">
        <LoadingSpinner :isActive="state.isPageLoading">

            <!-- Year / options row -->
            <div class="flex items-center gap-3 mb-3">
                <div class="flex items-center gap-2">
                    <label class="text-sm text-slate-600">Year</label>
                    <select v-model.number="year" @change="regenerateWeeks" class="px-2 py-1 border rounded text-sm">
                        <option v-for="y in [2025, 2026, 2027]" :key="y" :value="y">{{ y }}</option>
                    </select>
                </div>

                <div class="flex-1" />

                <div class="text-sm text-slate-600 max-w-xl">
                    Select a template in the left panel, then click a week on the grid to apply it starting that week.
                    <span class="ml-1">Shift+click to add an additional placement.</span>
                </div>
            </div>

            <!-- Main area -->
            <div class="flex gap-4 items-start">

                <!-- Right grid panel -->
                <section class="flex-1 min-w-0">
                    <div class="bg-white border rounded-lg overflow-hidden">
                        <!-- Header -->
                        <div class="flex items-stretch border-b border-slate-200">
                            <div class="w-56 min-w-[220px] p-3 border-r border-slate-200 flex items-center">
                                <div class="font-medium">Templates</div>
                            </div>

                            <!-- Weeks header (horizontally scrollable) -->
                            <div class="flex-1 overflow-x-auto bg-white" ref="weeksHeaderRef">
                                <div class="flex items-center gap-2 p-2 min-w-max">
                                    <div v-for="(w, i) in weeks" :key="`${w.year ?? ''}-${i}`"
                                        class="w-24 min-w-[96px] h-16 rounded bg-white border border-slate-200 flex flex-col items-center justify-center text-sm"
                                        :title="`Week ${w.weekNumber} — ${fmtDate(w.start)} to ${fmtDate(w.end)}`">
                                        <div class="font-semibold">W{{ w.weekNumber }}</div>
                                        <div class="text-xs text-slate-500 mt-1">{{ shortDate(w.start) }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Rows -->
                        <div class="p-3 max-h-[560px] overflow-auto">
                            <div class="flex flex-col gap-3">
                                <div v-for="(tpl, tplIndex) in state.draftTemplates" :key="tpl.id"
                                    class="flex items-start">
                                    <!-- Template column -->
                                    <div class="w-56 min-w-[220px] p-2 border-r border-slate-200">
                                        <div :class="['rounded-md px-3 py-2 text-white inline-block', tpl.id === selectedTemplateId ? 'ring-2 ring-indigo-100' : '']"
                                            :style="{ background: '#60A5FA' }">
                                            <div class="font-medium min-w-24">{{ tpl.name }}</div>
                                            <!-- <div v-if="tpl.startWeeks && tpl.startWeeks.length" class="text-xs opacity-90 mt-1">
                                                Starts: <span v-for="(s, idx) in tpl.startWeeks" :key="idx">W{{ s }}<span v-if="idx < tpl.startWeeks.length -1">, </span></span>
                                            </div> -->
                                        </div>
                                    </div>

                                    <!-- Weeks row (each row scrolls horizontally) -->
                                    <div class="flex-1 h-full" :ref="el => setRowRef(el, tplIndex)">
                                        <div class="flex items-center gap-2 p-2 min-w-max">
                                            <div v-for="(w, wi) in weeks" :key="`${tpl.id}-${wi}`"
                                                class="relative w-24 min-w-[96px] h-16 flex items-center justify-center rounded"
                                                :class="{
                                                    'cursor-pointer transform hover:-translate-y-1 hover:shadow-lg transition': !!selectedTemplateId,
                                                    'outline outline-2 outline-indigo-100': isInTemplateSpan(tpl, wi),
                                                    'shadow-inner': isStartOfTemplate(tpl, wi)
                                                }" @click="applySelectedTemplateToWeek(tpl.id, wi, $event)">
                                                <div v-if="isInTemplateSpan(tpl, wi)" class="absolute inset-1 rounded"
                                                    :style="{ background: tpl.color }"></div>

                                                <div v-if="isStartOfTemplate(tpl, wi)"
                                                    class="absolute left-2 top-2 bg-black/10 text-xs px-2 rounded">
                                                    Start
                                                </div>

                                                <div class="z-10 text-sm text-slate-700">
                                                    <span v-if="!isInTemplateSpan(tpl, wi)">—</span>
                                                    <span v-else
                                                        class="inline-block w-2 h-2 bg-white/80 rounded-full">&nbsp;</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div> <!-- template-row -->
                            </div> <!-- flex-col -->
                        </div> <!-- rows -->
                    </div> <!-- panel -->
                </section>
            </div>
        </LoadingSpinner>

    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { draftTemplateService } from '@/components/api/user/DraftTemplateService'
import { draftTemplateScheduleService } from '@/components/api/user/DraftTemplateScheduleService'
import type { Error } from '@/types'

type Week = { weekNumber: number; start: Date; end: Date; year?: number }
type Template = {
    id: string
    name: string
    lengthWeeks: number
    color: string
    startWeeks?: number[]
}

const state = reactive({
    isPageLoading: false,
    draftTemplates: [] as any,
    error: {} as Error,
})

async function fetchDraftTemplates() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await draftTemplateService.getDraftTemplates({})
        if (response?.data) {
            state.draftTemplates = response.data
        }
    } catch (error: any) {
        state.error = error
    } finally {
        state.isPageLoading = false
    }
}

/* Data */
const templates = ref<Template[]>([
    { id: 't1', name: 'Template A', lengthWeeks: 4, color: '#60A5FA', startWeeks: [] },
    { id: 't2', name: 'Template B', lengthWeeks: 8, color: '#F472B6', startWeeks: [] },
    { id: 't3', name: 'Template C', lengthWeeks: 2, color: '#34D399', startWeeks: [] },
    { id: 't4', name: 'Template D', lengthWeeks: 6, color: '#FBBF24', startWeeks: [] },
])

const selectedTemplateId = ref<string | null>(templates.value[0]?.id ?? null)
const year = ref<number>(new Date().getFullYear())

/* Weeks generation */
function useWeeks(yearVal: number): Week[] {
    const weeks: Week[] = []
    const jan4 = new Date(yearVal, 0, 4)
    const day = jan4.getDay() || 7
    const monday = new Date(jan4)
    monday.setDate(jan4.getDate() - (day - 1))

    for (let i = 0; i < 52; i++) {
        const start = new Date(monday)
        start.setDate(monday.getDate() + i * 7)
        const end = new Date(start)
        end.setDate(start.getDate() + 6)
        weeks.push({ weekNumber: i + 1, start, end, year: yearVal })
    }
    return weeks
}

const weeks = ref<Week[]>(useWeeks(year.value))
function regenerateWeeks() {
    weeks.value = useWeeks(year.value)
}

/* Placement helpers */
function isInTemplateSpan(tpl: Template, wi: number) {
    if (!tpl.startWeeks || tpl.startWeeks.length === 0) return false
    return tpl.startWeeks.some(sw => {
        const startIndex = sw - 1
        return wi >= startIndex && wi < startIndex + tpl.lengthWeeks
    })
}
function isStartOfTemplate(tpl: Template, wi: number) {
    if (!tpl.startWeeks || tpl.startWeeks.length === 0) return false
    return tpl.startWeeks.includes(wi + 1)
}
function fmtDate(v: Date) {
    return v.toLocaleDateString()
}
function shortDate(v: Date) {
    return `${v.getMonth() + 1}/${v.getDate()}`
}

/* Apply logic */
function clampStartWeekIndex(startIndex: number, lengthWeeks: number) {
    const maxStartIndex = Math.max(0, weeks.value.length - lengthWeeks)
    return Math.min(Math.max(0, startIndex), maxStartIndex)
}
function placementConflicts(startIndex: number, lengthWeeks: number, ignoreTemplateId?: string) {
    const endIndex = startIndex + lengthWeeks - 1
    for (const other of templates.value) {
        if (other.id === ignoreTemplateId) continue
        if (!other.startWeeks) continue
        for (const sw of other.startWeeks) {
            const otherStart = sw - 1
            const otherEnd = otherStart + other.lengthWeeks - 1
            if (!(endIndex < otherStart || startIndex > otherEnd)) return true
        }
    }
    return false
}

function applySelectedTemplateToWeek(templateId: string, wi: number, ev?: MouseEvent) {
    const tpl = state.draftTemplates.find((t: any) => t.id === templateId)
    if (!tpl) return

    tpl.startWeeks = tpl.startWeeks ?? []
    const clickedStartWeek = wi + 1
    const clampedIndex = clampStartWeekIndex(wi, tpl.lengthWeeks)
    const clampedWeek = clampedIndex + 1
    const shift = ev?.shiftKey ?? false

    if (shift) {
        const idx = tpl.startWeeks.indexOf(clickedStartWeek)
        if (idx !== -1) {
            tpl.startWeeks.splice(idx, 1)
            return
        }
        if (placementConflicts(clampedIndex, tpl.lengthWeeks, tpl.id)) {
            if (!window.confirm('This placement overlaps another template. Add it anyway?')) return
        }
        tpl.startWeeks.push(clampedWeek)
        tpl.startWeeks = Array.from(new Set(tpl.startWeeks)).sort((a, b) => a - b)
        return
    } else {
        if (tpl.startWeeks.length === 1 && tpl.startWeeks[0] === clickedStartWeek) {
            tpl.startWeeks = []
            return
        }
        if (placementConflicts(clampedIndex, tpl.lengthWeeks, tpl.id)) {
            if (!window.confirm('Applying this template here will overlap with another template. Proceed?')) return
        }
        tpl.startWeeks = [clampedWeek]
        return
    }
}

/* Scroll synchronization for header and template rows */
const weeksHeaderRef = ref<HTMLElement | null>(null)
const weeksRowsRefs = ref<Array<HTMLElement | null>>([])

function setRowRef(el: HTMLElement | null, index: number) {
    weeksRowsRefs.value[index] = el
}

let isSyncing = false
let rafId: number | null = null
const onScrollListeners: Array<() => void> = []

function syncScrollFrom(source: HTMLElement) {
    if (!source) return
    if (isSyncing) return
    isSyncing = true
    if (rafId) cancelAnimationFrame(rafId)
    rafId = requestAnimationFrame(() => {
        const left = source.scrollLeft
        if (weeksHeaderRef.value && weeksHeaderRef.value !== source) weeksHeaderRef.value.scrollLeft = left
        for (const r of weeksRowsRefs.value) {
            if (r && r !== source) r.scrollLeft = left
        }
        isSyncing = false
    })
}

onMounted(() => {
    fetchDraftTemplates()
    const header = weeksHeaderRef.value
    if (header) {
        const handler = () => syncScrollFrom(header)
        header.addEventListener('scroll', handler, { passive: true })
        onScrollListeners.push(() => header.removeEventListener('scroll', handler))
    }

    const attachRowListeners = () => {
        weeksRowsRefs.value.forEach((row) => {
            if (!row) return
            const handler = () => syncScrollFrom(row)
            row.addEventListener('scroll', handler, { passive: true })
            onScrollListeners.push(() => row.removeEventListener('scroll', handler))
        })
    }

    attachRowListeners()
})

onBeforeUnmount(() => {
    onScrollListeners.forEach((off) => off())
    onScrollListeners.length = 0
    if (rafId) cancelAnimationFrame(rafId)
})

watch([weeks, templates], async () => {
    await nextTick()
    weeksRowsRefs.value = templates.value.map((_, i) => weeksRowsRefs.value[i] ?? null)
    onScrollListeners.forEach((off) => off())
    onScrollListeners.length = 0

    const header = weeksHeaderRef.value
    if (header) {
        const handler = () => syncScrollFrom(header)
        header.addEventListener('scroll', handler, { passive: true })
        onScrollListeners.push(() => header.removeEventListener('scroll', handler))
    }
    weeksRowsRefs.value.forEach((row) => {
        if (!row) return
        const handler = () => syncScrollFrom(row)
        row.addEventListener('scroll', handler, { passive: true })
        onScrollListeners.push(() => row.removeEventListener('scroll', handler))
    })
})
</script>
