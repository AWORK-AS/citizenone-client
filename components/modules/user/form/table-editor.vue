<template>
    <div class="space-y-4">
        <div class="space-y-1">
            <FormLabel :for="'table_caption_' + props.fieldIndex" :label="$t('forms.table.caption')" />
            <FormTextField :id="'table_caption_' + props.fieldIndex" :name="'table_caption_' + props.fieldIndex"
                :placeholder="$t('forms.table.captionPlaceholder')" v-model="props.field.value"
                @focus="active = { row: -1, col: -1 }" />
        </div>

        <div class="overflow-x-auto">
            <table class="min-w-full border-collapse">
                <thead>
                    <tr>
                        <th v-for="(column, colIndex) in props.field.columns" :key="'col_' + colIndex"
                            class="p-1 align-top" :style="{ minWidth: '150px' }">
                            <div class="flex items-center gap-x-1">
                                <FormTextField :name="'col_' + props.fieldIndex + '_' + colIndex"
                                    :placeholder="$t('forms.table.columnName')" v-model="props.field.columns[colIndex]"
                                    @focus="active = { row: -1, col: colIndex }" />
                                <button type="button" :aria-label="$t('forms.table.removeColumn')"
                                    @click="removeColumn(colIndex)">
                                    <Icon name="ph:x" class="h-4 w-4 text-gray-400 hover:text-gray-700"
                                        aria-hidden="true" />
                                </button>
                            </div>
                        </th>
                        <th class="p-1 align-top">
                            <button type="button" class="text-sm text-primary whitespace-nowrap" @click="addColumn">
                                + {{ $t('forms.table.addColumn') }}
                            </button>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(row, rowIndex) in props.field.rows" :key="'row_' + rowIndex">
                        <td v-for="(column, colIndex) in props.field.columns" :key="'cell_' + rowIndex + '_' + colIndex"
                            class="p-1 align-top">
                            <FormTextField :name="'cell_' + props.fieldIndex + '_' + rowIndex + '_' + colIndex"
                                :placeholder="$t('forms.table.cellPlaceholder')"
                                v-model="props.field.rows[rowIndex][colIndex]"
                                @focus="active = { row: rowIndex, col: colIndex }" />
                        </td>
                        <td class="p-1 align-top">
                            <button type="button" :aria-label="$t('forms.table.removeRow')" @click="removeRow(rowIndex)">
                                <Icon name="ph:trash" class="h-4 w-4 text-gray-400 hover:text-gray-700"
                                    aria-hidden="true" />
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
            <button type="button" class="text-sm text-primary flex items-center gap-x-1" @click="addRow">
                <Icon name="ph:plus-circle" class="h-4 w-4" aria-hidden="true" />
                {{ $t('forms.table.addRow') }}
            </button>
            <ModulesUserFormMergeFieldPicker @insert="insertIntoActiveCell" />
        </div>

        <p class="text-xs text-gray-500">{{ $t('forms.table.hint') }}</p>
    </div>
</template>

<script setup lang="ts">
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

/**
 * Which cell was last in focus, so a field picked from the menu lands where the
 * administrator was working rather than always in the caption.
 */
const active = ref({ row: -1, col: -1 })

function addColumn() {
    props.field.columns.push('')
    props.field.rows.forEach((row: string[]) => row.push(''))
}

function removeColumn(colIndex: number) {
    if (props.field.columns.length <= 1) return
    props.field.columns.splice(colIndex, 1)
    props.field.rows.forEach((row: string[]) => row.splice(colIndex, 1))
}

function addRow() {
    props.field.rows.push(props.field.columns.map(() => ''))
}

function removeRow(rowIndex: number) {
    if (props.field.rows.length <= 1) return
    props.field.rows.splice(rowIndex, 1)
}

function insertIntoActiveCell(key: string) {
    const { row, col } = active.value

    if (row >= 0 && col >= 0) {
        const current = props.field.rows[row][col] ?? ''
        props.field.rows[row][col] = current ? `${current} ${key}` : key

        return
    }

    const current = props.field.value ?? ''
    props.field.value = current ? `${current} ${key}` : key
}
</script>
