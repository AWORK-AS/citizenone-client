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
                        class="relative border-l border-gray-100 cursor-pointer transition-colors hover:bg-gray-50/60"
                        :class="day.isToday && 'bg-tertiary/[0.03]'"
                        :style="{ height: gridHeight + 'px' }"
                        @click="$emit('dayClick', days[di])"
                        @dblclick="$emit('slotDblClick', days[di]?.date)">
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
                        <div v-for="ev in day.events" :key="ev.uuid" class="event-slot group/ev absolute"
                            :style="{ top: ev.top + 'px', height: ev.height + 'px', left: ev.left, width: ev.width }">
                            <button type="button"
                                :aria-label="ev.title"
                                class="h-full w-full overflow-hidden rounded-md border-l-2 px-1.5 py-0.5 text-left transition active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                                :class="[ev.colorClass, ev.completed && 'opacity-70', ev.isNow && 'ring-1 ring-inset ring-red-400']"
                                :style="ev.tagStyle"
                                @click.stop="$emit('eventClick', ev.raw)">
                                <span class="flex items-center gap-x-1">
                                    <span v-if="ev.isNow" class="h-1.5 w-1.5 flex-none rounded-full bg-red-500 motion-safe:animate-pulse"></span>
                                    <span class="truncate text-[11px] font-semibold" :class="ev.completed && 'line-through'">{{ ev.title }}</span>
                                    <!-- Part of a repeating plan (task #133). -->
                                    <Icon v-if="ev.raw?.is_recurring" name="ph:repeat" class="h-3 w-3 flex-none opacity-80"
                                        :title="$t('events.recurringScope.repeating')" />
                                    <!-- A journal note has been written from this booking. -->
                                    <Icon v-if="ev.hasNote" name="ph:notebook" class="h-3 w-3 flex-none opacity-80"
                                        :title="$t('events.linkedNote', { title: ev.raw.journal?.title ?? '' })" />
                                    <!-- Ended without its note: write it from here. -->
                                    <ModulesUserMyCalendarNoteNudge v-if="props.noteNudge" compact :event="ev.raw"
                                        @create="$emit('createJournal', ev.raw)" />
                                </span>
                                <span v-if="ev.height >= 30" class="block truncate text-[10px] tabular-nums opacity-75">
                                    {{ ev.timeLabel }}
                                </span>
                            </button>
                            <!-- Done / not done, as in the month view's menu. A sibling of the chip
                                 (a button can't hold a button); shows on hover and keyboard focus.
                                 Never on shifts. Each item applies to this one occurrence. -->
                            <Menu v-if="props.statusActions && !ev.raw?.is_shift" as="div"
                                class="status-menu absolute right-0.5 top-0.5 opacity-0 transition-opacity group-hover/ev:opacity-100 group-focus-within/ev:opacity-100"
                                @click.stop @dblclick.stop>
                                <MenuButton :aria-label="$t('events.statusMenuLabel', { title: ev.title ?? '' })"
                                    class="flex items-center rounded bg-white/90 p-0.5 text-gray-500 shadow-sm ring-1 ring-gray-200 hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                                    @click="placeStatusMenu" @keydown="placeStatusMenu">
                                    <Icon name="heroicons:ellipsis-horizontal" class="h-3.5 w-3.5" aria-hidden="true" />
                                </MenuButton>
                                <Teleport to="body">
                                    <transition enter-active-class="transition ease-out duration-100"
                                        enter-from-class="transform opacity-0 scale-95"
                                        enter-to-class="transform opacity-100 scale-100"
                                        leave-active-class="transition ease-in duration-75"
                                        leave-from-class="transform opacity-100 scale-100"
                                        leave-to-class="transform opacity-0 scale-95">
                                        <MenuItems :style="{ left: menuPos.x + 'px', top: menuPos.y + 'px' }"
                                            class="fixed z-[60] w-60 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                            <MenuItem v-if="ev.raw?.completion_status !== 'completed'" v-slot="{ active }">
                                                <button type="button"
                                                    :class="[active && 'bg-gray-100', 'text-green-700', 'flex w-full items-center gap-x-1.5 px-4 py-2 text-left text-sm']"
                                                    @click.stop="$emit('markStatus', ev.raw, 'completed')">
                                                    <Icon name="ph:check-circle" class="h-4 w-4" aria-hidden="true" />
                                                    {{ $t('events.markAsCompleted') }}
                                                </button>
                                            </MenuItem>
                                            <MenuItem v-if="ev.raw?.completion_status !== 'not_completed'" v-slot="{ active }">
                                                <button type="button"
                                                    :class="[active && 'bg-gray-100', 'text-red-700', 'flex w-full items-center gap-x-1.5 px-4 py-2 text-left text-sm']"
                                                    @click.stop="$emit('markStatus', ev.raw, 'not_completed')">
                                                    <Icon name="ph:x-circle" class="h-4 w-4" aria-hidden="true" />
                                                    {{ $t('events.markAsNotCompleted') }}
                                                </button>
                                            </MenuItem>
                                        </MenuItems>
                                    </transition>
                                </Teleport>
                            </Menu>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { eventTagColor, tintColor } from '@/composables/calendarEventPresentation'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import moment from 'moment'

const props = defineProps({
    // Each day: { date:'YYYY-MM-DD', fullDate, isToday, weekdayLabel, dayNumber, events:[raw...] }
    days: { type: Array as any, required: true },
    showHeader: { type: Boolean, default: true },
    // Show the "note missing" badge on citizen bookings (my calendar only).
    noteNudge: { type: Boolean, default: false },
    // Offer "mark as completed / not completed" on each event (emits markStatus).
    // Off unless the page handles it: the patient portal and the child calendar don't.
    statusActions: { type: Boolean, default: false },
})
defineEmits(['eventClick', 'dayClick', 'slotDblClick', 'createJournal', 'markStatus'])

const hourHeight = 48
const hours = Array.from({ length: 24 }, (_, i) => i)
const gridHeight = hourHeight * 24
const scroller = ref<HTMLElement | null>(null)

// re-evaluate "now" each minute so the line + badges stay live
const nowTick = ref(moment())
let timer: any = null
onMounted(() => {
    timer = setInterval(() => { nowTick.value = moment() }, 60000)
    // Scroll to ~1h before the earliest event. A day with no events used to
    // fall back to a hardcoded 07:00 regardless of the actual time - opening
    // the calendar in the evening on a quiet day landed on an empty-looking
    // grid with "now" scrolled 15 hours out of view. Anchor on the current
    // time instead whenever today is visible and nothing gives a better cue.
    nextTick(() => {
        if (!scroller.value) return
        let earliest: number | null = null
        for (const d of props.days as any[]) {
            for (const e of (d.events || [])) {
                const m = moment(e.date_time_start)
                const minutes = m.hours() * 60 + m.minutes()
                earliest = earliest === null ? minutes : Math.min(earliest, minutes)
            }
        }
        if (earliest === null) {
            const todayVisible = (props.days as any[]).some((d: any) => d.isToday)
            earliest = todayVisible ? nowTick.value.hours() * 60 + nowTick.value.minutes() : 7 * 60
        }
        scroller.value.scrollTop = Math.max(0, (earliest / 60) * hourHeight - hourHeight)
    })
})
onUnmounted(() => timer && clearInterval(timer))

// The status menu is teleported to <body> (fixed position) so the scrolling
// grid can't clip it, as the month view does. Placed on click and on the keys
// that open it, below the button, or above it near the bottom of the screen.
const menuPos = reactive({ x: 0, y: 0 })
function placeStatusMenu(e: Event) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const width = 240 // w-60
    const height = 80 // two items
    menuPos.x = Math.max(8, rect.right - width)
    menuPos.y = rect.bottom + 4 + height > window.innerHeight
        ? Math.max(8, rect.top - height - 4)
        : rect.bottom + 4
}

function hourLabel(h: number) {
    return h === 0 ? '' : String(h).padStart(2, '0')
}

function colorClass(type: string) {
    if (type === 'employees') return 'border-green-600 bg-green-600/10 text-green-900 hover:bg-green-600/[0.18]'
    if (type === 'my_self') return 'border-primary bg-primary/10 text-primary hover:bg-primary/[0.18]'
    return 'border-amber-500 bg-amber-500/10 text-amber-900 hover:bg-amber-500/[0.18]'
}

function tagStyle(e: any) {
    const color = eventTagColor(e)
    return color ? { borderLeftColor: color, backgroundColor: tintColor(color) } : {}
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
                    hasNote: !!c.raw.journal_id,
                    isNow: isNow(c.raw),
                    colorClass: colorClass(c.raw.type),
                    // The first tag's colour, when the customer gave it one: scan by colour.
                    tagStyle: tagStyle(c.raw),
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

<style scoped>
/* Overlapping events share a day column, so a chip can get very narrow. Below
   48px the status button would cover the chip and take its click, so it hides
   there; the chip's modal offers the same two actions. */
.event-slot {
    container-type: inline-size;
}

@container (max-width: 47px) {
    .status-menu {
        display: none;
    }
}

/* No hover on touch screens: keep the button visible. */
@media (hover: none) {
    .status-menu {
        opacity: 1;
    }
}
</style>
