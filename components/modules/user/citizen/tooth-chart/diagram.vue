<template>
    <div class="space-y-4">
        <!-- The chart is wider than a phone, so it scrolls on its own instead of
             forcing the page sideways. Each tooth is 44px, which is also the
             smallest comfortable touch target for chairside use on a tablet. -->
        <div class="overflow-x-auto pb-2">
            <div class="min-w-max mx-auto space-y-6">
                <div v-for="row in rows" :key="row.key" class="space-y-1">
                    <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">{{ $t(row.label) }}</p>
                    <div class="flex gap-1">
                        <div v-for="tooth in row.teeth" :key="tooth.uuid" class="flex flex-col items-center gap-1">
                            <span v-if="row.key === 'upper'" class="text-[11px] font-medium text-gray-500">
                                {{ toothLabel(tooth) }}
                            </span>

                            <!-- Gum health sits next to the tooth number so a
                                 screening can be read off the chart in one pass. -->
                            <span v-if="props.showPerio && row.key === 'upper'"
                                class="flex items-center gap-0.5 text-[10px] leading-none h-3">
                                <span v-if="perioOf(tooth)?.bleeding" class="size-1.5 rounded-full bg-red-500"
                                    :title="$t('citizens.toothChart.perio.bleeding')" />
                                <span class="text-gray-600">{{ perioOf(tooth)?.pocket_depth_mm ?? '' }}</span>
                            </span>

                            <svg :viewBox="`0 0 ${WIDTH} ${HEIGHT}`" :width="WIDTH" :height="HEIGHT"
                                class="rounded transition"
                                :class="tooth.uuid === props.selectedToothUuid ? 'ring-2 ring-primary' : ''"
                                role="button" tabindex="0" :aria-label="ariaLabel(tooth)"
                                @keydown.enter.prevent="select(tooth, 'whole')"
                                @keydown.space.prevent="select(tooth, 'whole')">
                                <title>{{ ariaLabel(tooth) }}</title>

                                <defs>
                                    <clipPath :id="`crown-${tooth.uuid}`">
                                        <path :d="crownOutline(tooth, row.key)" />
                                    </clipPath>
                                </defs>

                                <!-- The root is drawn for recognition only: it is
                                     not a surface, so it takes no clicks. -->
                                <path :d="rootOutline(tooth, row.key)" fill="#f3f4f6" stroke="#cbd5e1"
                                    stroke-width="0.75" pointer-events="none" />

                                <g :clip-path="`url(#crown-${tooth.uuid})`">
                                    <polygon v-for="face in faces(tooth, row.key)" :key="face.surface"
                                        :points="face.points" :fill="fillFor(tooth, face.surface)" stroke="#9ca3af"
                                        stroke-width="0.75" class="cursor-pointer"
                                        @click="select(tooth, face.surface)" />
                                </g>

                                <path :d="crownOutline(tooth, row.key)" fill="none" stroke="#6b7280" stroke-width="1"
                                    pointer-events="none" />

                                <!-- A tooth that is gone is crossed out, the way it
                                     is marked on paper charts. -->
                                <g v-if="isRemoved(tooth)" pointer-events="none" stroke="#111827" stroke-width="2.5">
                                    <line x1="4" :y1="crownTop(row.key) + 3" :x2="WIDTH - 4"
                                        :y2="crownTop(row.key) + CROWN - 3" />
                                    <line :x1="WIDTH - 4" :y1="crownTop(row.key) + 3" x2="4"
                                        :y2="crownTop(row.key) + CROWN - 3" />
                                </g>
                            </svg>

                            <span v-if="props.showPerio && row.key === 'lower'"
                                class="flex items-center gap-0.5 text-[10px] leading-none h-3">
                                <span v-if="perioOf(tooth)?.bleeding" class="size-1.5 rounded-full bg-red-500"
                                    :title="$t('citizens.toothChart.perio.bleeding')" />
                                <span class="text-gray-600">{{ perioOf(tooth)?.pocket_depth_mm ?? '' }}</span>
                            </span>

                            <span v-if="row.key === 'lower'" class="text-[11px] font-medium text-gray-500">
                                {{ toothLabel(tooth) }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span class="text-xs text-gray-500">{{ $t('citizens.toothChart.legend') }}</span>
            <span v-for="status in props.statusOptions" :key="status" class="inline-flex items-center gap-1.5 text-xs">
                <span class="size-3 rounded-sm ring-1 ring-gray-300" :style="{ backgroundColor: colorFor(status) }" />
                {{ $t(`citizens.toothChart.statuses.${status}`) }}
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const props = defineProps<{
    teeth: any[]
    statuses: any[]
    perio: any[]
    showPerio: boolean
    statusOptions: string[]
    selectedToothUuid?: string | null
    numbering: 'fdi' | 'universal'
    dentition: 'permanent' | 'primary'
}>()

const emit = defineEmits<{ (event: 'select', toothUuid: string, surface: string): void }>()

const { t } = useI18n()

const WIDTH = 44

const CROWN = 40

const ROOT = 16

const HEIGHT = CROWN + ROOT

// Kept in sync with CitizenToothStatus::STATUSES on the backend.
const STATUS_COLORS: Record<string, string> = {
    healthy: '#ffffff',
    caries: '#ef4444',
    filling: '#3b82f6',
    crown: '#fbbf24',
    bridge: '#8b5cf6',
    root_canal: '#ec4899',
    implant: '#64748b',
    veneer: '#22d3ee',
    sealant: '#2dd4bf',
    fracture: '#f97316',
    extracted: '#374151',
    missing: '#d1d5db',
    planned: '#a3e635',
    observation: '#fde047',
    not_erupted: '#eef2ff',
}

const rows = computed(() => {
    const teeth = (props.teeth || []).filter((tooth: any) => (tooth.dentition || 'permanent') === props.dentition)

    // A chart is read from the patient's right to their left: the right
    // quadrant runs from the back tooth inwards, the left one outwards again.
    // FDI encodes both, so the same rule covers permanent (1-4) and primary
    // (5-8) quadrants.
    const row = (rightQuadrant: number, leftQuadrant: number) => [
        ...teeth.filter((tooth: any) => quadrantOf(tooth) === rightQuadrant)
            .sort((a: any, b: any) => positionOf(b) - positionOf(a)),
        ...teeth.filter((tooth: any) => quadrantOf(tooth) === leftQuadrant)
            .sort((a: any, b: any) => positionOf(a) - positionOf(b)),
    ]

    const isPrimary = props.dentition === 'primary'

    return [
        { key: 'upper', label: 'citizens.toothChart.upperJaw', teeth: row(isPrimary ? 5 : 1, isPrimary ? 6 : 2) },
        { key: 'lower', label: 'citizens.toothChart.lowerJaw', teeth: row(isPrimary ? 8 : 4, isPrimary ? 7 : 3) },
    ]
})

const statusIndex = computed(() => {
    const index: Record<string, Record<string, any>> = {}

    for (const status of props.statuses || []) {
        if (!index[status.tooth_uuid]) index[status.tooth_uuid] = {}
        index[status.tooth_uuid][status.surface] = status
    }

    return index
})

const perioIndex = computed(() => {
    const index: Record<string, any> = {}

    for (const measurement of props.perio || []) {
        index[measurement.tooth_uuid] = measurement
    }

    return index
})

function perioOf(tooth: any) {
    return perioIndex.value[tooth.uuid] || null
}

function quadrantOf(tooth: any): number {
    return Math.floor((tooth?.fdi_number ?? 0) / 10)
}

function positionOf(tooth: any): number {
    return (tooth?.fdi_number ?? 0) % 10
}

/**
 * Front teeth (incisors and canines) have four surfaces, back teeth five: the
 * chewing surface in the middle plus the four sides. Which side is which
 * follows the quadrant, so the surface nearest the midline always points at the
 * centre of the chart and the cheek side faces away from the tongue.
 *
 * The same four/five split is what dmf-s and DMF-S are counted from, so the
 * drawing and the figures cannot drift apart.
 */
function isBackTooth(tooth: any): boolean {
    return positionOf(tooth) >= 4
}

function crownTop(rowKey: string): number {
    // Roots point away from the bite: upwards in the upper jaw, downwards in
    // the lower one.
    return rowKey === 'upper' ? ROOT : 0
}

function surfaceNames(tooth: any) {
    const quadrant = quadrantOf(tooth)
    const isUpper = [1, 2, 5, 6].includes(quadrant)
    const isPatientRight = [1, 4, 5, 8].includes(quadrant)

    return {
        top: isUpper ? 'buccal' : 'lingual',
        bottom: isUpper ? 'lingual' : 'buccal',
        right: isPatientRight ? 'mesial' : 'distal',
        left: isPatientRight ? 'distal' : 'mesial',
    }
}

function faces(tooth: any, rowKey: string) {
    const names = surfaceNames(tooth)
    const top = crownTop(rowKey)
    const bottom = top + CROWN
    const right = WIDTH

    if (!isBackTooth(tooth)) {
        // Four triangles meeting in the middle of the crown.
        const cx = WIDTH / 2
        const cy = top + CROWN / 2

        return [
            { surface: names.top, points: `0,${top} ${right},${top} ${cx},${cy}` },
            { surface: names.right, points: `${right},${top} ${right},${bottom} ${cx},${cy}` },
            { surface: names.bottom, points: `0,${bottom} ${right},${bottom} ${cx},${cy}` },
            { surface: names.left, points: `0,${top} 0,${bottom} ${cx},${cy}` },
        ]
    }

    const inset = 12

    return [
        { surface: names.top, points: `0,${top} ${right},${top} ${right - inset},${top + inset} ${inset},${top + inset}` },
        { surface: names.right, points: `${right},${top} ${right},${bottom} ${right - inset},${bottom - inset} ${right - inset},${top + inset}` },
        { surface: names.bottom, points: `0,${bottom} ${right},${bottom} ${right - inset},${bottom - inset} ${inset},${bottom - inset}` },
        { surface: names.left, points: `0,${top} 0,${bottom} ${inset},${bottom - inset} ${inset},${top + inset}` },
        { surface: 'occlusal', points: `${inset},${top + inset} ${right - inset},${top + inset} ${right - inset},${bottom - inset} ${inset},${bottom - inset}` },
    ]
}

/**
 * Back teeth are drawn as a broad crown with rounded corners, front teeth as a
 * narrower crown that rounds off towards the biting edge, which is roughly how
 * they look on a chart drawn by hand.
 */
function crownOutline(tooth: any, rowKey: string): string {
    const top = crownTop(rowKey)
    const bottom = top + CROWN
    const back = isBackTooth(tooth)
    const inset = back ? 1 : 6
    const left = inset
    const right = WIDTH - inset
    // The biting edge is the side facing the opposite jaw.
    const bite = rowKey === 'upper' ? bottom : top
    const neck = rowKey === 'upper' ? top : bottom
    const biteRadius = back ? 6 : 12
    const neckRadius = back ? 4 : 5
    const biteDirection = rowKey === 'upper' ? -1 : 1

    return [
        `M ${left} ${neck + biteDirection * neckRadius * -1}`,
        `Q ${left} ${neck} ${left + neckRadius} ${neck}`,
        `L ${right - neckRadius} ${neck}`,
        `Q ${right} ${neck} ${right} ${neck + biteDirection * neckRadius * -1}`,
        `L ${right} ${bite + biteDirection * biteRadius}`,
        `Q ${right} ${bite} ${right - biteRadius} ${bite}`,
        `L ${left + biteRadius} ${bite}`,
        `Q ${left} ${bite} ${left} ${bite + biteDirection * biteRadius}`,
        'Z',
    ].join(' ')
}

/**
 * Molars carry two roots, everything else one. The root is decoration that
 * makes the cell read as a tooth rather than a box.
 */
function rootOutline(tooth: any, rowKey: string): string {
    const isUpper = rowKey === 'upper'
    const neck = isUpper ? ROOT : CROWN
    const tip = isUpper ? 3 : CROWN + ROOT - 3
    const molar = positionOf(tooth) >= 6

    if (!molar) {
        return `M 14 ${neck} L 30 ${neck} L 25 ${tip} L 19 ${tip} Z`
    }

    return [
        `M 8 ${neck} L 20 ${neck} L 17 ${tip} L 11 ${tip} Z`,
        `M 24 ${neck} L 36 ${neck} L 33 ${tip} L 27 ${tip} Z`,
    ].join(' ')
}

function colorFor(status: string): string {
    return STATUS_COLORS[status] || '#ffffff'
}

function fillFor(tooth: any, surface: string): string {
    const forTooth = statusIndex.value[tooth.uuid]
    if (!forTooth) return '#ffffff'

    // A status on the whole tooth colours every surface; a surface status only
    // colours its own face.
    const status = forTooth[surface]?.status || forTooth.whole?.status

    return status ? colorFor(status) : '#ffffff'
}

function isRemoved(tooth: any): boolean {
    const status = statusIndex.value[tooth.uuid]?.whole?.status

    return status === 'extracted' || status === 'missing'
}

function toothLabel(tooth: any): string {
    if (props.numbering !== 'universal') return String(tooth.fdi_number)

    // Universal notation letters the primary teeth A-T and numbers the
    // permanent ones 1-32.
    return String(tooth.universal_code ?? tooth.number)
}

function ariaLabel(tooth: any): string {
    const recorded = statusIndex.value[tooth.uuid]
    const status = recorded?.whole?.status

    return status
        ? `${t('citizens.toothChart.tooth')} ${toothLabel(tooth)}: ${t(`citizens.toothChart.statuses.${status}`)}`
        : `${t('citizens.toothChart.tooth')} ${toothLabel(tooth)}`
}

function select(tooth: any, surface: string) {
    emit('select', tooth.uuid, surface)
}
</script>
