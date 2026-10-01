<template>
    <div role="radiogroup" class="inline-flex shrink-0 rounded-lg border border-surface-200 bg-surface-50 p-0.5 text-xs">
        <button v-for="option in options" :key="option.value" type="button" role="radio"
            :aria-checked="props.modelValue === option.value" @click="emit('update:modelValue', option.value)"
            :class="[
                'flex items-center gap-x-1 rounded-md px-2.5 py-1 font-medium transition-colors',
                props.modelValue === option.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800',
            ]">
            <Icon :name="option.icon" class="h-3.5 w-3.5" aria-hidden="true" />
            {{ option.label }}
        </button>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

/**
 * How a box behaves in a layout. Unlocked: required / the user's choice /
 * hidden. Locked: shown (stored as required) / hidden, since nothing is left
 * to the user.
 */
const props = defineProps({
    modelValue: {
        type: String,
        required: true,
    },
    locked: {
        type: Boolean,
        default: false,
    },
})
const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()

const options = computed(() => props.locked
    ? [
        { value: 'mandatory', label: t('dailyOverviewLayouts.states.shown'), icon: 'ph:eye' },
        { value: 'hidden', label: t('dailyOverviewLayouts.states.hidden'), icon: 'ph:eye-slash' },
    ]
    : [
        { value: 'mandatory', label: t('dailyOverviewLayouts.states.mandatory'), icon: 'ph:lock-simple' },
        { value: 'optional', label: t('dailyOverviewLayouts.states.optional'), icon: 'ph:user' },
        { value: 'hidden', label: t('dailyOverviewLayouts.states.hidden'), icon: 'ph:eye-slash' },
    ])
</script>
