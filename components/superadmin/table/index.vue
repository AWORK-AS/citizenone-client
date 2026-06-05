<template>
    <div class="bg-white border border-[#EAECF0] rounded-xl overflow-hidden shadow-sm">
        <!-- Loading -->
        <div v-if="props.isLoading" class="flex items-center justify-center py-16">
            <Icon name="ph:spinner" class="w-7 h-7 text-[#42AED9] animate-spin" />
        </div>

        <!-- Empty -->
        <div v-else-if="!props.data?.data?.length" class="flex flex-col items-center gap-3 py-16 text-[#8891A4]">
            <Icon :name="props.emptyIcon" class="w-12 h-12 opacity-30" />
            <p class="text-sm font-medium">{{ props.emptyMessage }}</p>
            <p v-if="props.emptySubMessage" class="text-xs">{{ props.emptySubMessage }}</p>
        </div>

        <!-- Table -->
        <table v-else class="w-full">
            <thead>
                <tr class="border-b border-[#EAECF0] bg-[#F9FAFB]">
                    <th v-if="props.selection" class="sa-th" width="50">
                        <label class="inline-flex items-center cursor-pointer relative">
                            <input
                                type="checkbox"
                                :checked="isAllSelected"
                                @change="handleSelectAll"
                                class="peer w-4 h-4 appearance-none border bg-white border-[#EAECF0] rounded mr-2 checked:bg-[#205E77] checked:border-[#205E77] focus:ring-0 cursor-pointer"
                            />
                            <span class="pointer-events-none absolute w-4 h-4 flex items-center justify-center">
                                <Icon name="ph:check-bold" class="h-3 w-3 text-white" />
                            </span>
                        </label>
                    </th>
                    <th
                        v-for="(col, index) in props.columnHeaders"
                        :key="index"
                        class="sa-th"
                        :style="col.width ? `width:${col.width}px` : ''"
                    >
                        <div
                            class="flex items-center gap-x-1.5"
                            :class="{
                                'justify-start': col.textAlign !== 'right' && col.textAlign !== 'center',
                                'justify-end': col.textAlign === 'right',
                                'justify-center': col.textAlign === 'center',
                            }"
                        >
                            <p class="grow truncate">
                                {{ col.name && (col.isTranslateName ? $t(col.name) : col.name) }}
                            </p>
                            <div class="flex items-center" v-if="col.sorter">
                                <Icon
                                    name="heroicons:arrows-up-down"
                                    class="h-4 w-4 cursor-pointer text-[#8891A4] hover:text-[#5C6478]"
                                    v-show="col.key !== props.sortData?.sortField"
                                    @click="$emit('sort', { sort: 'ascend', column: col.key })"
                                />
                                <Icon
                                    name="heroicons:arrow-down"
                                    class="h-4 w-4 cursor-pointer text-[#8891A4] hover:text-[#5C6478]"
                                    v-show="['ascend', null].includes(props.sortData?.sortOrder) && col.key === props.sortData?.sortField"
                                    @click="$emit('sort', { sort: 'descend', column: col.key })"
                                />
                                <Icon
                                    name="heroicons:arrow-up"
                                    class="h-4 w-4 cursor-pointer text-[#8891A4] hover:text-[#5C6478]"
                                    v-show="props.sortData?.sortOrder === 'descend' && col.key === props.sortData?.sortField"
                                    @click="$emit('sort', { sort: null, column: null })"
                                />
                            </div>
                        </div>
                    </th>
                </tr>
            </thead>
            <tbody>
                <slot name="body" :selectedRows="selectedRows" :handleRowSelect="handleRowSelect" />
            </tbody>
        </table>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    columnHeaders: {
        type: Array as () => Array<{
            name?: string
            key?: string
            sorter?: boolean
            textAlign?: 'left' | 'right' | 'center'
            width?: number
            isTranslateName?: boolean
        }>,
        required: true,
    },
    data: {
        type: Object as () => { data?: any[]; [key: string]: any },
        required: true,
    },
    isLoading: {
        type: Boolean,
        required: true,
    },
    sortData: {
        type: Object as () => { sortField?: string; sortOrder?: string | null },
        required: false,
        default: () => ({}),
    },
    selection: {
        type: Boolean,
        required: false,
        default: false,
    },
    emptyMessage: {
        type: String,
        required: false,
        default: '',
    },
    emptySubMessage: {
        type: String,
        required: false,
        default: '',
    },
    emptyIcon: {
        type: String,
        required: false,
        default: 'ph:magnifying-glass',
    },
    rowKey: {
        type: String,
        required: false,
        default: 'id',
    },
})

const emit = defineEmits(['sort', 'selectionChange'])

const selectedRows = ref<any[]>([])

const isAllSelected = computed(() => {
    if (!props.data?.data?.length) return false
    return selectedRows.value.length === props.data.data.length
})

const handleSelectAll = (event: Event) => {
    const target = event.target as HTMLInputElement
    selectedRows.value = target.checked ? [...(props.data.data ?? [])] : []
    emit('selectionChange', selectedRows.value)
}

const handleRowSelect = (row: any) => {
    const key = props.rowKey
    const index = selectedRows.value.findIndex(r => r[key] == row[key])
    if (index > -1) {
        selectedRows.value.splice(index, 1)
    } else {
        selectedRows.value.push(row)
    }
    emit('selectionChange', selectedRows.value)
}
</script>

<style scoped>
.sa-th {
    text-align: left;
    padding: 10px 16px;
    font-size: 11px;
    font-weight: 600;
    color: #8891A4;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    white-space: nowrap;
}
</style>
