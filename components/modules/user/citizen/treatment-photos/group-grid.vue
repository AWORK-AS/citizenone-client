<template>
    <div class="space-y-8">
        <section v-for="group in props.groups" :key="group.key">
            <div class="mb-3 flex items-baseline gap-2">
                <h3 class="text-base font-semibold text-gray-900">
                    {{ group.milestone?.name ?? $t('treatmentPhotos.noMilestone') }}
                </h3>
                <span class="text-xs text-gray-400">{{ group.photos.length }}</span>
            </div>

            <div class="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                <article v-for="photo in group.photos" :key="photo.uuid"
                    class="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5" :class="[
                        props.selectMode && isSelected(photo) ? '!ring-2 !ring-primary' : '',
                        props.selectMode ? 'cursor-pointer' : ''
                    ]" @click="props.selectMode && emit('toggle', photo)">
                    <div class="relative">
                        <ModulesUserCitizenTreatmentPhotosThumb :photo="photo" :loadImage="props.loadImage" />

                        <label v-if="props.selectMode"
                            class="absolute left-2 top-2 flex size-7 cursor-pointer items-center justify-center rounded-md bg-white/90 shadow"
                            @click.stop>
                            <input type="checkbox" class="size-4 accent-primary" :checked="isSelected(photo)"
                                :disabled="!isSelected(photo) && props.selected.length >= 2"
                                :aria-label="$t('treatmentPhotos.select')" @change="emit('toggle', photo)" />
                        </label>
                    </div>

                    <div class="space-y-1.5 p-3">
                        <div class="flex items-center justify-between gap-2">
                            <p class="text-sm font-medium text-gray-900">{{ formatDate(photo.taken_at) }}</p>
                            <div class="flex items-center gap-1" v-if="!props.selectMode">
                                <button type="button" v-if="props.allowEdit" @click="emit('edit', photo)"
                                    :title="$t('edit')" :aria-label="$t('edit')"
                                    class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                                    <Icon name="ph:pencil-simple" class="size-4" />
                                </button>
                                <button type="button" v-if="props.allowDelete && photo.can_delete !== false"
                                    @click="emit('delete', photo)" :title="$t('delete')" :aria-label="$t('delete')"
                                    class="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600">
                                    <Icon name="ph:trash" class="size-4" />
                                </button>
                            </div>
                        </div>
                        <p class="truncate text-xs text-gray-500">
                            {{ photo.milestone?.name ?? $t('treatmentPhotos.noMilestone') }}
                        </p>
                        <p class="text-xs text-gray-400"
                            v-if="photo.days_since_start !== null && photo.days_since_start !== undefined">
                            {{ $t('treatmentPhotos.compare.daysSince', { days: photo.days_since_start }) }}
                        </p>
                        <Badge type="neutral" v-if="photo.uploaded_by_patient">
                            {{ props.viewer === 'patient' ? $t('treatmentPhotos.uploadedByYou') : tt('treatmentPhotos.uploadedByPatient') }}
                        </Badge>
                    </div>
                </article>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useTerminology } from '@/composables/useTerminology'

const props = defineProps({
    groups: {
        type: Array as () => any[],
        required: true,
    },
    loadImage: {
        type: Function as unknown as () => (photo: any) => Promise<string>,
        required: true,
    },
    allowEdit: {
        type: Boolean,
        default: false,
    },
    // A photo can still opt out through its own can_delete flag.
    allowDelete: {
        type: Boolean,
        default: false,
    },
    // Who is looking: the patient sees "Uploaded by you" instead of the staff wording.
    viewer: {
        type: String as () => 'staff' | 'patient',
        default: 'staff',
    },
    selectMode: {
        type: Boolean,
        default: false,
    },
    selected: {
        type: Array as () => string[],
        default: () => [],
    },
})

const emit = defineEmits(['edit', 'delete', 'toggle'])
const { tt } = useTerminology()

function isSelected(photo: any): boolean {
    return props.selected.includes(photo.uuid)
}

function formatDate(date: any) {
    return date ? moment(date).format('DD-MM-YYYY') : '-'
}
</script>
