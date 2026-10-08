<template>
    <!-- Task #133: how far an edit or delete of a repeating event reaches. -->
    <fieldset class="space-y-2">
        <legend class="text-sm font-medium text-gray-700 mb-1">{{ props.label }}</legend>
        <label v-for="option in options" :key="option.value"
            class="flex items-center gap-x-2 cursor-pointer text-sm text-gray-700">
            <input type="radio" class="w-4 h-4 text-primary focus:ring-primary" :name="name" :value="option.value"
                :checked="props.modelValue === option.value"
                @change="emit('update:modelValue', option.value)" />
            {{ option.label }}
        </label>
    </fieldset>
</template>

<script setup lang="ts">
import type { PropType } from "vue"
import { useI18n } from "vue-i18n"

export type RecurringScope = 'this' | 'this_and_following' | 'all'

const props = defineProps({
    modelValue: {
        type: String as PropType<RecurringScope>,
        default: 'this',
    },
    label: {
        type: String,
        required: true,
    },
})

const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()

// Unique per instance, so the edit and delete modals' radios never share a group.
const name = `recurring-scope-${Math.random().toString(36).slice(2)}`

const options = computed(() => [
    { value: 'this', label: t('events.recurringScope.this') },
    { value: 'this_and_following', label: t('events.recurringScope.thisAndFollowing') },
    { value: 'all', label: t('events.recurringScope.all') },
])
</script>
