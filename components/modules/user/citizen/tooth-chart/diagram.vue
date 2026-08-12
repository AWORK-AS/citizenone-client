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

                            <svg :viewBox="`0 0 ${SIZE} ${SIZE}`" :width="SIZE" :height="SIZE"
                                class="rounded-sm ring-1 transition"
                                :class="tooth.uuid === props.selectedToothUuid ? 'ring-2 ring-primary' : 'ring-gray-200'"
                                role="button" tabindex="0" :aria-label="ariaLabel(tooth)"
                                @keydown.enter.prevent="select(tooth, 'whole')"
                                @keydown.space.prevent="select(tooth, 'whole')">
                                <title>{{ ariaLabel(tooth) }}</title>

                                <polygon v-for="face in faces(tooth)" :key="face.surface" :points="face.points"
                                    :fill="fillFor(tooth, face.surface)" stroke="#9ca3af" stroke-width="0.75"
                                    class="cursor-pointer" @click="select(tooth, face.surface)" />

                                <!-- A tooth that is gone is marked across the whole
                                     cell, the way it is drawn on paper charts. -->
                                <g v-if="isRemoved(tooth)" pointer-events="none" stroke="#111827" stroke-width="2.5">
                                    <line x1="4" y1="4" :x2="SIZE - 4" :y2="SIZE - 4" />
                                    <line :x1="SIZE - 4" y1="4" x2="4" :y2="SIZE - 4" />
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

const SIZE = 44

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
 * A flat chart shows five surfaces per tooth: the chewing surface in the middle
 * and the four sides around it. Which side is which depends on the quadrant:
 * the cheek side faces up in the upper jaw and down in the lower jaw, and the
 * surface nearest the midline sits toward the centre of the chart.
 */
function faces(tooth: any) {
    const quadrant = quadrantOf(tooth)
    const isUpper = [1, 2, 5, 6].includes(quadrant)
    const isPatientRight = [1, 4, 5, 8].includes(quadrant)

    const top = isUpper ? 'buccal' : 'lingual'
    const bottom = isUpper ? 'lingual' : 'buccal'
    const right = isPatientRight ? 'mesial' : 'distal'
    const left = isPatientRight ? 'distal' : 'mesial'

    const outer = SIZE
    const inner = 12

    return [
        { surface: top, points: `0,0 ${outer},0 ${outer - inner},${inner} ${inner},${inner}` },
        { surface: right, points: `${outer},0 ${outer},${outer} ${outer - inner},${outer - inner} ${outer - inner},${inner}` },
        { surface: bottom, points: `0,${outer} ${outer},${outer} ${outer - inner},${outer - inner} ${inner},${outer - inner}` },
        { surface: left, points: `0,0 0,${outer} ${inner},${outer - inner} ${inner},${inner}` },
        { surface: 'occlusal', points: `${inner},${inner} ${outer - inner},${inner} ${outer - inner},${outer - inner} ${inner},${outer - inner}` },
    ]
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
