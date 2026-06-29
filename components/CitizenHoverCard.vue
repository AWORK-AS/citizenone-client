<template>
    <span ref="triggerEl" class="inline-flex min-w-0 max-w-full" @mouseenter="onEnter" @mouseleave="onLeave">
        <slot>{{ name }}</slot>

        <Teleport to="body">
            <Transition enter-active-class="transition ease-out duration-150" enter-from-class="opacity-0 translate-y-1"
                enter-to-class="opacity-100 translate-y-0" leave-active-class="transition ease-in duration-100"
                leave-from-class="opacity-100" leave-to-class="opacity-0">
                <div v-if="open"
                    class="fixed z-[110] w-64 rounded-xl border border-surface-200 bg-white p-3 text-left shadow-xl"
                    :style="{ top: pos.top + 'px', left: pos.left + 'px' }"
                    @mouseenter="cancelClose" @mouseleave="onLeave">
                    <div v-if="state.loading" class="flex items-center gap-3">
                        <div class="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
                        <div class="flex-1 space-y-1.5">
                            <div class="h-3 w-3/4 rounded bg-gray-200 animate-pulse" />
                            <div class="h-2.5 w-1/2 rounded bg-gray-100 animate-pulse" />
                        </div>
                    </div>

                    <template v-else-if="state.data">
                        <div class="flex items-center gap-3">
                            <img :src="avatar" class="h-10 w-10 shrink-0 rounded-full object-cover border-2"
                                :class="riskBorder" />
                            <div class="min-w-0">
                                <p class="truncate text-sm font-semibold text-slate-900">{{ displayName }}</p>
                                <p v-if="riskLabelKey" class="text-xs" :class="riskText">{{ $t(riskLabelKey) }}</p>
                            </div>
                        </div>

                        <div class="mt-2.5 space-y-1 text-xs text-slate-500">
                            <p v-if="state.data.birthday" class="flex items-center gap-x-1.5">
                                <Icon name="ph:cake" class="h-3.5 w-3.5" />
                                {{ formatDateToReadable(state.data.birthday) }}
                            </p>
                            <p v-if="state.data.phone" class="flex items-center gap-x-1.5">
                                <Icon name="ph:phone" class="h-3.5 w-3.5" />
                                {{ state.data.phone }}
                            </p>
                        </div>

                        <div class="mt-3 flex items-center gap-1.5 border-t border-surface-100 pt-2.5">
                            <button type="button" @click.stop="go('journals')"
                                class="flex-1 rounded-lg bg-surface-50 px-2 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors">
                                {{ $t('citizens.tabs.journals') }}
                            </button>
                            <button type="button" @click.stop="go('medicine-journals')"
                                class="flex-1 rounded-lg bg-surface-50 px-2 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors">
                                {{ $t('citizens.tabs.medicineCard') }}
                            </button>
                        </div>
                    </template>
                </div>
            </Transition>
        </Teleport>
    </span>
</template>

<script setup lang="ts">
import { citizenService } from '@/components/api/user/CitizenService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'

// `preset` lets callers that already have the citizen object (e.g. a list row)
// seed the card without an extra request.
const props = defineProps<{ uuid: string; name?: string; preset?: any }>()

const { formatDateToReadable } = useDatetimeFormatter()

// Cache fetched summaries across all hover cards for the session.
const cache = useState<Record<string, any>>('citizenHoverCache', () => ({}))

const triggerEl = ref<HTMLElement | null>(null)
const open = ref(false)
const pos = reactive({ top: 0, left: 0 })
const state = reactive({ loading: false, data: null as any })
let enterTimer: ReturnType<typeof setTimeout> | null = null
let leaveTimer: ReturnType<typeof setTimeout> | null = null

const displayName = computed(() =>
    [state.data?.firstname, state.data?.lastname].filter(Boolean).join(' ') || props.name || '')

const avatar = computed(() =>
    state.data?.image ??
    `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${encodeURIComponent(displayName.value || '?')}`)

const risk = computed(() => state.data?.latest_risk_assessment?.assessment ?? null)
const riskBorder = computed(() => ({
    'border-green-700': risk.value === 'no risk',
    'border-yellow-500': risk.value === 'increased risk',
    'border-red-600': risk.value === 'acute increased risk',
    'border-secondary': !risk.value,
}))
const riskText = computed(() => ({
    'text-green-700': risk.value === 'no risk',
    'text-yellow-600': risk.value === 'increased risk',
    'text-red-600': risk.value === 'acute increased risk',
}))
const riskLabelKey = computed(() => {
    switch (risk.value) {
        case 'no risk': return 'overview.riskAssessment.risk.noRisk'
        case 'increased risk': return 'overview.riskAssessment.risk.increasedRisk'
        case 'acute increased risk': return 'overview.riskAssessment.risk.acuteIncreasedRisk'
        default: return ''
    }
})

function computePosition() {
    const el = triggerEl.value
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cardWidth = 256
    let left = rect.left
    if (left + cardWidth > window.innerWidth - 12) left = window.innerWidth - cardWidth - 12
    if (left < 12) left = 12
    pos.top = rect.bottom + 6
    pos.left = left
}

async function load() {
    if (props.preset) {
        state.data = props.preset
        return
    }
    if (!props.uuid) return
    if (cache.value[props.uuid]) {
        state.data = cache.value[props.uuid]
        return
    }
    state.loading = true
    try {
        const response = await citizenService.getCitizen(props.uuid)
        if (response?.data) {
            cache.value[props.uuid] = response.data
            state.data = response.data
        }
    } catch {
        // ignore — the trigger still works as plain text/link
    }
    state.loading = false
}

function onEnter() {
    if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = null }
    enterTimer = setTimeout(() => {
        computePosition()
        open.value = true
        load()
    }, 250)
}

function onLeave() {
    if (enterTimer) { clearTimeout(enterTimer); enterTimer = null }
    leaveTimer = setTimeout(() => { open.value = false }, 150)
}

function cancelClose() {
    if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = null }
}

function go(section: string) {
    open.value = false
    navigateTo(`/citizens/${props.uuid}/${section}`)
}

onBeforeUnmount(() => {
    if (enterTimer) clearTimeout(enterTimer)
    if (leaveTimer) clearTimeout(leaveTimer)
})
</script>
