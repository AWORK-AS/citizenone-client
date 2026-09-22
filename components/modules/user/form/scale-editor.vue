<template>
    <div class="space-y-5">
        <div class="space-y-1">
            <FormLabel :for="'scale_label_' + props.fieldIndex" :label="$t('forms.scale.question')" />
            <FormTextField :id="'scale_label_' + props.fieldIndex" :name="'scale_label_' + props.fieldIndex"
                :placeholder="$t('forms.fields.inputYourQuestionTitleHere')" v-model="props.field.value" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1">
                <FormLabel :for="'scale_key_' + props.fieldIndex" :label="$t('forms.scale.scaleKey')" />
                <FormTextField :id="'scale_key_' + props.fieldIndex" :name="'scale_key_' + props.fieldIndex"
                    placeholder="trivsel" v-model="props.field.scaleKey" @blur="normaliseKey" />
                <p class="text-xs text-gray-500">{{ $t('forms.scale.scaleKeyHint') }}</p>
            </div>

            <div class="space-y-1">
                <FormLabel :for="'scale_max_' + props.fieldIndex" :label="$t('forms.scale.maxScore')" />
                <FormSelect :id="'scale_max_' + props.fieldIndex" :options="maxScoreOptions" :canClear="false"
                    :searchable="false" v-model="props.field.maxScore" />
                <p class="text-xs text-gray-500">{{ $t('forms.scale.maxScoreHint') }}</p>
            </div>

            <div class="space-y-1">
                <FormLabel :label="$t('forms.scale.allowHalf')" />
                <FormSwitch :value="props.field.allowHalf === true"
                    @toggleSwitch="props.field.allowHalf = !props.field.allowHalf" />
                <p class="text-xs text-gray-500">{{ $t('forms.scale.allowHalfHint') }}</p>
            </div>
        </div>

        <!-- Preview, so the administrator sees the instrument rather than a table of hex codes. -->
        <div class="space-y-1">
            <FormLabel :label="$t('forms.scale.preview')" />
            <div class="flex rounded-sm overflow-hidden">
                <div v-for="(band, bandIndex) in props.field.bands" :key="'preview_' + bandIndex"
                    class="py-1.5 px-1 text-center text-[10px] font-semibold uppercase tracking-wide text-white truncate"
                    :style="{ backgroundColor: band.color, width: bandWidth(bandIndex) }">
                    {{ band.label }}
                </div>
            </div>
            <div class="flex border border-gray-300 rounded-sm mt-1">
                <div v-for="step in props.field.maxScore + 1" :key="'step_' + step"
                    class="grow py-1.5 text-center text-xs text-gray-600 border-r border-gray-200 last:border-r-0">
                    {{ step - 1 }}
                </div>
            </div>
        </div>

        <div class="space-y-2">
            <FormLabel :label="$t('forms.scale.bands')" />
            <div v-for="(band, bandIndex) in props.field.bands" :key="'band_' + bandIndex"
                class="flex items-center gap-x-2">
                <div class="w-24">
                    <FormNumberField :name="'band_to_' + props.fieldIndex + '_' + bandIndex"
                        :placeholder="$t('forms.scale.upTo')" v-model="band.to" />
                </div>
                <div class="grow">
                    <FormTextField :name="'band_label_' + props.fieldIndex + '_' + bandIndex"
                        :placeholder="$t('forms.scale.bandLabel')" v-model="band.label" />
                </div>
                <FormColorPicker :id="'band_color_' + props.fieldIndex + '_' + bandIndex" v-model="band.color" />
                <button type="button" @click="removeBand(bandIndex)" :aria-label="$t('delete')">
                    <Icon name="ph:trash" class="h-5 w-5 text-gray-500 hover:text-gray-800" aria-hidden="true" />
                </button>
            </div>
            <button type="button" class="text-sm text-primary flex items-center gap-x-1" @click="addBand">
                <Icon name="ph:plus-circle" class="h-4 w-4" aria-hidden="true" />
                {{ $t('forms.scale.addBand') }}
            </button>
        </div>

        <div class="space-y-2">
            <FormLabel :label="$t('forms.scale.raters')" />
            <p class="text-xs text-gray-500">{{ $t('forms.scale.ratersHint') }}</p>
            <div v-for="(rater, raterIndex) in props.field.raters" :key="'rater_' + raterIndex"
                class="flex items-center gap-x-2">
                <div class="grow">
                    <FormTextField :name="'rater_label_' + props.fieldIndex + '_' + raterIndex"
                        :placeholder="$t('forms.scale.raterLabel')" v-model="rater.label"
                        @blur="syncRaterKey(raterIndex)" />
                </div>
                <div class="w-40">
                    <FormTextField :name="'rater_key_' + props.fieldIndex + '_' + raterIndex" placeholder="staff"
                        v-model="rater.key" @blur="normaliseRaterKey(raterIndex)" />
                </div>
                <button type="button" @click="removeRater(raterIndex)" :aria-label="$t('delete')">
                    <Icon name="ph:trash" class="h-5 w-5 text-gray-500 hover:text-gray-800" aria-hidden="true" />
                </button>
            </div>
            <button type="button" class="text-sm text-primary flex items-center gap-x-1" @click="addRater">
                <Icon name="ph:plus-circle" class="h-4 w-4" aria-hidden="true" />
                {{ $t('forms.scale.addRater') }}
            </button>
        </div>

        <div class="space-y-3">
            <div class="flex items-center gap-x-3">
                <FormSwitch :value="props.field.showHistory"
                    @toggleSwitch="props.field.showHistory = !props.field.showHistory" />
                <label class="text-sm text-gray-700 cursor-pointer"
                    @click="props.field.showHistory = !props.field.showHistory">
                    {{ $t('forms.scale.showHistory') }}
                </label>
            </div>
            <div class="flex items-center gap-x-3">
                <FormSwitch :value="props.field.perGoal" @toggleSwitch="props.field.perGoal = !props.field.perGoal" />
                <label class="text-sm text-gray-700 cursor-pointer" @click="props.field.perGoal = !props.field.perGoal">
                    {{ $t('forms.scale.perGoal') }}
                </label>
            </div>
            <p class="text-xs text-gray-500">{{ $t('forms.scale.perGoalHint') }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
    field: {
        type: Object,
        required: true,
    },
    fieldIndex: {
        type: Number,
        required: true,
    },
})

const maxScoreOptions = [
    { value: 5, label: '0 - 5' },
    { value: 10, label: '0 - 10' },
]

/**
 * The band boundary is the highest score still inside the band, so a band is as
 * wide as the distance from the one before it.
 */
function bandWidth(bandIndex: number): string {
    const bands = props.field.bands ?? []
    const max = Number(props.field.maxScore) || 10
    const from = bandIndex === 0 ? 0 : Number(bands[bandIndex - 1]?.to ?? 0)
    const to = Number(bands[bandIndex]?.to ?? max)
    const span = Math.max(to - from, 0)

    return `${(span / max) * 100}%`
}

/** The key is matched across templates, so it has to survive being typed by hand. */
function slug(value: string): string {
    return (value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/æ/g, 'ae')
        .replace(/ø/g, 'oe')
        .replace(/å/g, 'aa')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 64)
}

function normaliseKey() {
    props.field.scaleKey = slug(props.field.scaleKey) || 'trivsel'
}

function normaliseRaterKey(raterIndex: number) {
    const rater = props.field.raters[raterIndex]
    rater.key = slug(rater.key) || slug(rater.label) || `rater_${raterIndex + 1}`
}

/** A new party gets a key derived from its name, unless the admin set one. */
function syncRaterKey(raterIndex: number) {
    const rater = props.field.raters[raterIndex]
    if (!rater.key) {
        rater.key = slug(rater.label) || `rater_${raterIndex + 1}`
    }
}

function addBand() {
    const bands = props.field.bands
    const max = Number(props.field.maxScore) || 10
    bands.push({ to: max, label: t('forms.scale.bandLabel'), color: '#93b25c' })
}

function removeBand(bandIndex: number) {
    if (props.field.bands.length > 1) {
        props.field.bands.splice(bandIndex, 1)
    }
}

function addRater() {
    props.field.raters.push({ key: '', label: '' })
}

function removeRater(raterIndex: number) {
    if (props.field.raters.length > 1) {
        props.field.raters.splice(raterIndex, 1)
    }
}
</script>
