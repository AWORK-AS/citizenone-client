<template>
    <div class="p-5 space-y-3">
        <div class="flex gap-x-3">
            <div v-if="props.number" class="pt-0.5">{{ props.number }}.</div>
            <div class="grow">
                <h3 v-if="props.field?.value" class="font-medium">
                    {{ props.field.value }}
                    <span v-if="props.field?.required" class="text-red-600">*</span>
                </h3>
                <p v-if="props.field?.helpText" class="text-sm text-gray-500 mt-1">{{ props.field.helpText }}</p>
            </div>
        </div>

        <div class="overflow-x-auto">
            <table class="min-w-full border-collapse">
                <thead v-if="columns.length">
                    <tr>
                        <th v-for="(column, colIndex) in columns" :key="'h_' + colIndex"
                            class="border border-gray-300 bg-gray-100 px-2 py-1 text-left text-sm font-semibold">
                            {{ column }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, rowIndex) in cells" :key="'r_' + rowIndex">
                        <td v-for="(column, colIndex) in columns" :key="'c_' + rowIndex + '_' + colIndex"
                            class="border border-gray-300 p-0">
                            <textarea
                                class="w-full min-h-[38px] resize-y border-0 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                                :value="row[colIndex] ?? ''" rows="1"
                                @input="update(rowIndex, colIndex, ($event.target as HTMLTextAreaElement).value)" />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <button v-if="props.field?.allowAddRows !== false" type="button"
            class="text-sm text-primary flex items-center gap-x-1" @click="addRow">
            <Icon name="ph:plus-circle" class="h-4 w-4" aria-hidden="true" />
            {{ $t('forms.table.addRow') }}
        </button>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    field: {
        type: Object,
        required: true,
    },
    modelValue: {
        type: [Array, String],
        required: false,
        default: null,
    },
    number: {
        type: Number,
        default: 0,
    },
})

const emit = defineEmits(['update:modelValue'])

const columns = computed<string[]>(() => props.field?.columns ?? [])

/**
 * Until someone edits it, the table shows the rows the template was built with,
 * so a row of merge fields or a fixed label is already in place.
 */
const cells = computed<string[][]>(() => {
    const value = props.modelValue

    if (typeof value === 'string' && value) {
        try {
            const parsed = JSON.parse(value)
            if (Array.isArray(parsed) && parsed.length) return parsed
        } catch {
            // fall through to the template's own rows
        }
    }

    if (Array.isArray(value) && value.length) return value as string[][]

    return (props.field?.rows ?? []).map((row: string[]) => [...row])
})

function update(rowIndex: number, colIndex: number, value: string) {
    const next = cells.value.map((row) => [...row])
    while (next.length <= rowIndex) next.push(columns.value.map(() => ''))
    next[rowIndex][colIndex] = value
    emit('update:modelValue', next)
}

function addRow() {
    emit('update:modelValue', [...cells.value.map((row) => [...row]), columns.value.map(() => '')])
}
</script>
