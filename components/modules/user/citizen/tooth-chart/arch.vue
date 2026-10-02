<template>
    <div class="space-y-3">
        <div class="relative overflow-x-auto rounded-2xl bg-gradient-to-b from-slate-50 to-white ring-1 ring-slate-100 px-2 py-4">
            <span class="absolute left-4 top-4 text-[11px] font-semibold uppercase tracking-wide text-gray-300">
                {{ $t('citizens.toothChart.upperJaw') }}
            </span>
            <span class="absolute left-4 bottom-4 text-[11px] font-semibold uppercase tracking-wide text-gray-300">
                {{ $t('citizens.toothChart.lowerJaw') }}
            </span>
            <svg :viewBox="`0 0 ${BOX_W} ${BOX_H}`" class="mx-auto block w-full max-w-[680px]" role="group"
                :aria-label="$t('citizens.toothChart.title')">
                <!-- Midline and the line between the jaws, the way both are
                     drawn on a paper chart. -->
                <line :x1="CENTER_X" y1="28" :x2="CENTER_X" :y2="BOX_H - 28" stroke="#e2e8f0" stroke-width="1"
                    stroke-dasharray="4 6" />
                <line x1="150" :y1="BOX_H / 2" :x2="BOX_W - 150" :y2="BOX_H / 2" stroke="#e2e8f0" stroke-width="1"
                    stroke-dasharray="4 6" />

                <g v-for="tooth in placed" :key="tooth.uuid">
                    <g :transform="tooth.transform" class="cursor-pointer outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" role="button" tabindex="0"
                        :aria-label="ariaLabel(tooth)" @click="emit('select', tooth.uuid, 'whole')"
                        @keydown.enter.prevent="emit('select', tooth.uuid, 'whole')"
                        @keydown.space.prevent="emit('select', tooth.uuid, 'whole')">
                        <title>{{ ariaLabel(tooth) }}</title>

                        <path v-for="(root, index) in tooth.shape.roots" :key="`root-${index}`" :d="root"
                            fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2" />

                        <path v-if="tooth.uuid === props.selectedToothUuid" :d="tooth.shape.crown" fill="none"
                            stroke="#1e3a5f" stroke-width="7" stroke-opacity="0.12" stroke-linejoin="round" />

                        <path :d="tooth.shape.crown" :fill="fillFor(tooth)"
                            :stroke="tooth.uuid === props.selectedToothUuid ? '#1e3a5f' : '#94a3b8'"
                            :stroke-width="tooth.uuid === props.selectedToothUuid ? 2 : 1.2"
                            stroke-linejoin="round" class="transition-[fill]" />

                        <!-- The grooves are what makes a molar read as a molar. -->
                        <path v-for="(groove, index) in tooth.shape.grooves" :key="`groove-${index}`" :d="groove"
                            fill="none" stroke="#94a3b8" stroke-width="0.9" stroke-linecap="round" />

                        <g v-if="isRemoved(tooth)" stroke="#111827" stroke-width="2.4">
                            <line x1="6" y1="30" x2="28" y2="52" />
                            <line x1="28" y1="30" x2="6" y2="52" />
                        </g>
                    </g>

                    <text :x="tooth.labelX" :y="tooth.labelY" text-anchor="middle" dominant-baseline="middle"
                        :class="tooth.uuid === props.selectedToothUuid ? 'fill-primary' : 'fill-gray-400'"
                        :style="`font-size: 11px; font-weight: ${tooth.uuid === props.selectedToothUuid ? 700 : 500};
                            font-variant-numeric: tabular-nums;`">
                        {{ toothLabel(tooth) }}
                    </text>

                    <g v-if="props.showPerio && perioOf(tooth)">
                        <circle v-if="perioOf(tooth)?.bleeding" :cx="tooth.perioX" :cy="tooth.perioY" r="3"
                            fill="#ef4444" />
                        <text v-if="perioOf(tooth)?.pocket_depth_mm" :x="tooth.perioX + 8" :y="tooth.perioY"
                            text-anchor="middle" dominant-baseline="middle" class="fill-gray-600"
                            style="font-size: 10px;">
                            {{ perioOf(tooth)?.pocket_depth_mm }}
                        </text>
                    </g>
                </g>
            </svg>
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
    selectedToothUuid?: string | null
    numbering: 'fdi' | 'universal'
    dentition: 'permanent' | 'primary'
}>()

const emit = defineEmits<{ (event: 'select', toothUuid: string, surface: string): void }>()

const { t } = useI18n()

const BOX_W = 660

const BOX_H = 560

const CENTER_X = BOX_W / 2

/**
 * A mouth seen from above is wider across the molars than it is deep from
 * front to back, so the arch is an oval rather than a circle. The two jaws sit
 * on their own arcs with the bite opening between them.
 */
const RADIUS_X = 258

const RADIUS_Y = 190

const UPPER_CENTER_Y = 262

const LOWER_CENTER_Y = 298

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

/**
 * When several surfaces of one tooth are recorded, the arch shows the finding
 * that matters most, so a decayed surface is never hidden behind a filling.
 */
const SEVERITY = [
    'caries', 'fracture', 'extracted', 'missing', 'root_canal', 'implant',
    'bridge', 'crown', 'veneer', 'filling', 'sealant', 'planned', 'observation', 'not_erupted', 'healthy',
]

/**
 * Tooth silhouettes, drawn in a 34 x 58 box with the root pointing up and the
 * biting edge at the bottom. Each tooth is rotated into place on the arch, so
 * one drawing per tooth type is enough.
 */
const SHAPES: Record<string, { crown: string; roots: string[]; grooves: string[] }> = {
    incisor: {
        crown: 'M 7 30 C 5 40, 6 50, 9 54 L 25 54 C 28 50, 29 40, 27 30 Z',
        roots: ['M 13 4 C 11 14, 12 24, 14 30 L 20 30 C 22 24, 23 14, 21 4 C 18 2, 16 2, 13 4 Z'],
        grooves: ['M 12 46 L 22 46'],
    },
    canine: {
        crown: 'M 7 30 C 5 40, 8 50, 17 56 C 26 50, 29 40, 27 30 Z',
        roots: ['M 12 2 C 10 13, 11 24, 14 30 L 20 30 C 23 24, 24 13, 22 2 C 19 0, 15 0, 12 2 Z'],
        grooves: ['M 17 42 L 17 52'],
    },
    premolar: {
        crown: 'M 5 30 C 3 40, 4 50, 8 55 C 13 58, 21 58, 26 55 C 30 50, 31 40, 29 30 Z',
        roots: ['M 12 4 C 10 14, 11 24, 14 30 L 20 30 C 23 24, 24 14, 22 4 C 19 2, 15 2, 12 4 Z'],
        grooves: ['M 10 44 C 15 41, 19 41, 24 44'],
    },
    molar: {
        crown: 'M 3 28 C 1 39, 2 51, 7 56 C 13 60, 21 60, 27 56 C 32 51, 33 39, 31 28 Z',
        roots: [
            'M 7 5 C 5 15, 7 24, 10 28 L 15 28 C 14 20, 12 12, 11 5 C 10 3, 8 3, 7 5 Z',
            'M 27 5 C 29 15, 27 24, 24 28 L 19 28 C 20 20, 22 12, 23 5 C 24 3, 26 3, 27 5 Z',
        ],
        grooves: ['M 8 42 C 14 39, 20 39, 26 42', 'M 17 39 L 17 52'],
    },
}

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

function quadrantOf(tooth: any): number {
    return Math.floor((tooth?.fdi_number ?? 0) / 10)
}

function positionOf(tooth: any): number {
    return (tooth?.fdi_number ?? 0) % 10
}

function shapeOf(tooth: any) {
    const position = positionOf(tooth)
    const isPrimary = (tooth.dentition || 'permanent') === 'primary'

    if (position <= 2) return SHAPES.incisor
    if (position === 3) return SHAPES.canine
    // A primary tooth in position 4 or 5 is a molar; a permanent one is a premolar.
    if (position <= 5) return isPrimary ? SHAPES.molar : SHAPES.premolar

    return SHAPES.molar
}

/**
 * Teeth sit on an ellipse, upper jaw above the midline and lower jaw below,
 * each one turned so its root points away from the centre of the mouth. That is
 * the arch a dentist is used to reading.
 */
const placed = computed(() => {
    const teeth = (props.teeth || []).filter((tooth: any) => (tooth.dentition || 'permanent') === props.dentition)

    const arch = (rightQuadrant: number, leftQuadrant: number) => [
        ...teeth.filter((tooth: any) => quadrantOf(tooth) === rightQuadrant)
            .sort((a: any, b: any) => positionOf(b) - positionOf(a)),
        ...teeth.filter((tooth: any) => quadrantOf(tooth) === leftQuadrant)
            .sort((a: any, b: any) => positionOf(a) - positionOf(b)),
    ]

    const isPrimary = props.dentition === 'primary'
    const upper = arch(isPrimary ? 5 : 1, isPrimary ? 6 : 2)
    const lower = arch(isPrimary ? 8 : 4, isPrimary ? 7 : 3)

    const scale = isPrimary ? 1.3 : 1.15

    const place = (row: any[], centerY: number, fromDegrees: number, toDegrees: number) => row.map((tooth: any, index: number) => {
        const step = row.length > 1 ? index / (row.length - 1) : 0.5
        const angle = ((fromDegrees + (toDegrees - fromDegrees) * step) * Math.PI) / 180

        const x = CENTER_X + RADIUS_X * Math.cos(angle)
        const y = centerY + RADIUS_Y * Math.sin(angle)
        // Turned so the root points away from the middle of the mouth.
        const rotation = (Math.atan2(y - centerY, x - CENTER_X) * 180) / Math.PI + 90

        return {
            ...tooth,
            shape: shapeOf(tooth),
            // The drawing is 34 x 58 with its root up, so it is centred on its
            // own crown before being rotated onto the arch.
            transform: `translate(${x} ${y}) rotate(${rotation}) scale(${scale}) translate(-17 -44)`,
            labelX: CENTER_X + (RADIUS_X + 46) * Math.cos(angle),
            labelY: centerY + (RADIUS_Y + 46) * Math.sin(angle),
            perioX: CENTER_X + (RADIUS_X + 22) * Math.cos(angle),
            perioY: centerY + (RADIUS_Y + 22) * Math.sin(angle),
        }
    })

    // The upper jaw curves above its own centre and the lower jaw below its
    // own, which leaves the bite open in the middle.
    return [...place(upper, UPPER_CENTER_Y, 194, 346), ...place(lower, LOWER_CENTER_Y, 166, 14)]
})

function statusOf(tooth: any): string | null {
    const recorded = statusIndex.value[tooth.uuid]

    if (!recorded) return null

    const found = Object.values(recorded).map((status: any) => status.status)

    for (const status of SEVERITY) {
        if (found.includes(status)) return status
    }

    return null
}

function fillFor(tooth: any): string {
    const status = statusOf(tooth)

    return status ? (STATUS_COLORS[status] || '#ffffff') : '#ffffff'
}

function isRemoved(tooth: any): boolean {
    const status = statusIndex.value[tooth.uuid]?.whole?.status

    return status === 'extracted' || status === 'missing'
}

function perioOf(tooth: any) {
    return perioIndex.value[tooth.uuid] || null
}

function toothLabel(tooth: any): string {
    if (props.numbering !== 'universal') return String(tooth.fdi_number)

    return String(tooth.universal_code ?? tooth.number)
}

function ariaLabel(tooth: any): string {
    const status = statusOf(tooth)

    return status
        ? `${t('citizens.toothChart.tooth')} ${toothLabel(tooth)}: ${t(`citizens.toothChart.statuses.${status}`)}`
        : `${t('citizens.toothChart.tooth')} ${toothLabel(tooth)}`
}
</script>
