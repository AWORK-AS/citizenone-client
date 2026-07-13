<template>
    <div class="overflow-hidden rounded-2xl bg-white ring-1 ring-gray-200 shadow-sm">
        <!-- Day headers -->
        <div v-if="showHeader" class="flex border-b border-gray-200">
            <div class="w-14 flex-none" />
            <div class="grid flex-1" :style="{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }">
                <div v-for="(day, di) in days" :key="di"
                    class="flex flex-col items-center gap-y-1 py-3"
                    :class="days.length > 1 && 'cursor-pointer hover:bg-gray-50 transition-colors'"
                    @click="days.length > 1 && $emit('dayClick', day)">
                    <span class="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{{ day.weekdayLabel }}</span>
                    <span :class="day.isToday
                        ? 'flex h-8 w-8 items-center justify-center rounded-full bg-tertiary text-sm font-semibold text-white'
                        : 'flex h-8 w-8 items-center justify-center text-sm font-semibold text-gray-800'">
                        {{ day.dayNumber }}
                    </span>
                </div>
            </div>
        </div>

        <!-- Scrollable time grid -->
        <div ref="scroller" class="relative max-h-[34rem] overflow-y-auto">
            <div class="flex">
                <!-- hour gutter -->
                <div class="w-14 flex-none">
                    <div v-for="h in hours" :key="h" class="relative" :style="{ height: hourHeight + 'px' }">
                        <span class="absolute -top-2 right-2 text-[10px] tabular-nums text-gray-400">{{ hourLabel(h) }}</span>
                    </div>
                </div>
                <!-- day columns -->
                <div class="grid flex-1" :style="{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }">
                    <div v-for="(day, di) in laidOut" :key="di"
                        class="relative border-l border-gray-100"
                        :class="day.isToday && 'bg-tertiary/[0.03]'"
                        :style="{ height: gridHeight + 'px' }">
                        <!-- hour lines -->
                        <div v-for="h in hours" :key="h" class="border-b border-gray-100"
                            :style="{ height: hourHeight + 'px' }" />
                        <!-- now line -->
                        <div v-if="day.isToday && nowTop !== null"
                            class="pointer-events-none absolute inset-x-0 z-20" :style="{ top: nowTop + 'px' }">
                            <div class="relative border-t-2 border-red-500">
                                <span class="absolute -left-1 -top-[3px] h-2 w-2 rounded-full bg-red-500"></span>
                            </div>
                        </div>
                        <!-- events -->
                        <button v-for="ev in day.events" :key="ev.uuid" type="button"
                            :aria-label="ev.title"
                            class="group/ev absolute overflow-hidden rounded-md border-l-2 px-1.5 py-0.5 text-left transition active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                            :class="[ev.colorClass, ev.completed && 'opacity-70', ev.isNow && 'ring-1 ring-inset ring-red-400']"
                            :style="{ top: ev.top + 'px', height: ev.height + 'px', left: ev.left, width: ev.width }"
                            @click="$emit('eventClick', ev.raw)">
                            <span class="flex items-center gap-x-1">
                                <span v-if="ev.isNow" class="h-1.5 w-1.5 flex-none rounded-full bg-red-500 motion-safe:animate-pulse"></span>
                                <span class="truncate text-[11px] font-semibold" :class="ev.completed && 'line-through'">{{ ev.title }}</span>
                            </span>
                            <span v-if="ev.height >= 30" class="block truncate text-[10px] tabular-nums opacity-75">
                                {{ ev.timeLabel }}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'

const props = defineProps({
    // Each day: { date:'YYYY-MM-DD', fullDate, isToday, weekdayLabel, dayNumber, events:[raw...] }
    days: { type: Array as any, required: true },
    showHeader: { type: Boolean, default: true },
})
defineEmits(['eventClick', 'dayClick'])

const hourHeight = 48
const hours = Array.from({ length: 24 }, (_, i) => i)
const gridHeight = hourHeight * 24
const scroller = ref<HTMLElement | null>(null)

// re-evaluate "now" each minute so the line + badges stay live
const nowTick = ref(moment())
let timer: any = null
onMounted(() => {
    timer = setInterval(() => { nowTick.value = moment() }, 60000)
    // scroll to ~1h before the earliest event, else 07:00
    nextTick(() => {
        if (!scroller.value) return
        let earliest = 7 * 60
        for (const d of props.days as any[]) {
            for (const e of (d.events || [])) {
                const m = moment(e.date_time_start)
                earliest = Math.min(earliest, m.hours() * 60 + m.minutes())
            }
        }
        scroller.value.scrollTop = Math.max(0, (earliest / 60) * hourHeight - hourHeight)
    })
})
onUnmounted(() => timer && clearInterval(timer))

function hourLabel(h: number) {
    return h === 0 ? '' : String(h).padStart(2, '0')
}

function colorClass(type: string) {
    if (type === 'employees') return 'border-green-600 bg-green-600/10 text-green-900 hover:bg-green-600/[0.18]'
    if (type === 'my_self') return 'border-primary bg-primary/10 text-primary hover:bg-primary/[0.18]'
    return 'border-amber-500 bg-amber-500/10 text-amber-900 hover:bg-amber-500/[0.18]'
}

function isNow(e: any) {
    return nowTick.value.isBetween(moment(e.date_time_start), moment(e.date_time_end), null, '[)')
}

const nowTop = computed(() => {
    const n = nowTick.value
    return (n.hours() * 60 + n.minutes()) / 60 * hourHeight
})

// Position events within each day and split overlapping events into columns.
const laidOut = computed(() => {
    return (props.days as any[]).map((day: any) => {
        const dayStart = moment(day.date, 'YYYY-MM-DD').startOf('day')
        const items = (day.events || []).map((e: any) => {
            const start = Math.max(0, moment(e.date_time_start).diff(dayStart, 'minutes'))
            const end = Math.min(1440, moment(e.date_time_end).diff(dayStart, 'minutes'))
            return { raw: e, startMin: start, endMin: Math.max(end, start + 15) }
        }).sort((a: any, b: any) => a.startMin - b.startMin || a.endMin - b.endMin)

        // Assign columns cluster by cluster.
        const positioned: any[] = []
        let cluster: any[] = []
        let clusterEnd = -1
        const flush = () => {
            const nCols = Math.max(1, ...cluster.map((c: any) => c.col + 1))
            for (const c of cluster) {
                positioned.push({
                    uuid: c.raw.uuid || `${c.raw.id}`,
                    raw: c.raw,
                    title: c.raw.title,
                    completed: c.raw.completion_status === 'completed',
                    isNow: isNow(c.raw),
                    colorClass: colorClass(c.raw.type),
                    timeLabel: `${moment(c.raw.date_time_start).format('HH:mm')} – ${moment(c.raw.date_time_end).format('HH:mm')}`,
                    top: c.startMin / 60 * hourHeight,
                    height: Math.max(22, (c.endMin - c.startMin) / 60 * hourHeight - 2),
                    left: `calc(${(c.col / nCols) * 100}% + 2px)`,
                    width: `calc(${(1 / nCols) * 100}% - 4px)`,
                })
            }
            cluster = []
        }
        for (const it of items) {
            if (it.startMin >= clusterEnd && cluster.length) flush()
            // first free column whose last event ends <= this start
            let col = 0
            const used = cluster.filter((c: any) => c.endMin > it.startMin).map((c: any) => c.col)
            while (used.includes(col)) col++
            cluster.push({ ...it, col })
            clusterEnd = Math.max(clusterEnd, it.endMin)
        }
        if (cluster.length) flush()

        return { isToday: day.isToday, events: positioned }
    })
})
</script>
