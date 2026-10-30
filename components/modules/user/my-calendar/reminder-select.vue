<template>
    <!-- The reminder the staff on the event get before it starts, as a push and in their notifications. -->
    <div class="space-y-1">
        <FormLabel :for="props.id" :label="$t('events.form.reminder.label')" />
        <FormSelect :id="props.id" v-model="selected" :options="options" :canClear="false" :canDeselect="false"
            :searchable="false" openDirection="top" data-testid="calendar-reminder" />
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { CALENDAR_REMINDER_OPTIONS, NO_CALENDAR_REMINDER, reminderLabel } from '@/utils/calendarReminder'

const props = defineProps({
    // Minutes before the event, or null for no reminder.
    modelValue: {
        type: Number as () => number | null,
        default: null,
    },
    id: {
        type: String,
        default: 'reminder_minutes',
    },
})

const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()

const options = computed(() => [null, ...CALENDAR_REMINDER_OPTIONS].map((minutes) => {
    const label = reminderLabel(minutes)
    return {
        value: minutes === null ? NO_CALENDAR_REMINDER : String(minutes),
        label: label.count === undefined ? t(label.key) : t(label.key, { count: label.count }, label.count),
    }
}))

const selected = computed({
    get: () => props.modelValue === null || props.modelValue === undefined ? NO_CALENDAR_REMINDER : String(props.modelValue),
    set: (value: string | null) => emit('update:modelValue', !value || value === NO_CALENDAR_REMINDER ? null : Number(value)),
})
</script>
