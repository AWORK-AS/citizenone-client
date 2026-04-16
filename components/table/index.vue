<template>
    <table>
        <thead>
            <tr>
                <th v-if="props.selection" width="50">
                    <label class="inline-flex items-center cursor-pointer relative">
                        <input type="checkbox" :checked="isAllSelected" @change="handleSelectAll"
                            class="peer w-5 h-5 appearance-none border bg-white border-primary rounded-sm mr-2 checked:bg-secondary checked:border-secondary focus:ring-0 cursor-pointer" />
                        <span class="pointer-events-none absolute w-5 h-5 flex items-center justify-center">
                            <Icon name="ph:check-bold" class="h-4 w-4 text-white" />
                        </span>
                    </label>
                </th>
                <th v-for="(item, index) in props.columnHeaders" :key="index" :width="props.width">
                    <div class="flex items-center gap-x-2" :class="[
                        item.textAlign === 'left' && 'text-left',
                        item.textAlign === 'right' && 'text-right',
                        item.textAlign === 'center' && 'text-center']">
                        <p class="grow truncate">
                            {{ item.name && (item.isTranslateName ? $t(item.name) : item.name) }}
                        </p>
                        <div class="flex items-center justify-end" v-if="item.sorter">
                            <Icon name="heroicons:arrows-up-down"
                                class="h-5 w-5 cursor-pointer text-gray-400 hover:text-gray-500" aria-hidden="true"
                                v-show="item.key !== props?.sortData?.sortField"
                                @click="$emit('sort', { sort: 'ascend', column: item.key })" />
                            <Icon name="heroicons:arrow-down"
                                class="h-5 w-5 cursor-pointer text-gray-400 hover:text-gray-500" aria-hidden="true"
                                v-show="['ascend', null].includes(props?.sortData?.sortOrder) && item.key === props?.sortData?.sortField"
                                @click="$emit('sort', { sort: 'descend', column: item.key })" />
                            <Icon name="heroicons:arrow-up"
                                class="h-5 w-5 cursor-pointer text-gray-400 hover:text-gray-500" aria-hidden="true"
                                v-show="props?.sortData?.sortOrder == 'descend' && item.key === props?.sortData?.sortField"
                                @click="$emit('sort', { sort: null, column: null })" />
                        </div>
                    </div>
                </th>
            </tr>
        </thead>
        <tbody>
            <slot name="body" :selectedRows="selectedRows" :handleRowSelect="handleRowSelect"></slot>
            <tr v-if="props.isLoading || (props.data.data && props.data.data.length === 0)">
                <td :colspan="props.selection ? props.columnHeaders.length + 1 : props.columnHeaders.length"
                    class="text-center h-36">
                    <div class="flex items-center justify-center flex-col gap-2" v-if="props.isLoading">
                        <div class="w-16 h-16 border-b-2 border-gray-900 rounded-full animate-spin"></div>
                        Loading...
                    </div>
                    <div v-else>
                        <span v-if="props.emptyMessage && props.emptyMessage.length > 0">{{ props.emptyMessage }}</span>
                        <span v-else>{{ $t('theresNoDataAvailableToDisplay') }}.</span>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script setup lang="ts">
const props = defineProps({
    columnHeaders: {
        type: Object,
        required: true,
    },
    data: {
        type: Object,
        required: true,
    },
    isLoading: {
        type: Boolean,
        required: true,
    },
    sortData: {
        type: Object,
        required: false,
    },
    textAlign: {
        type: String,
        required: false,
        default: 'left'
    },
    width: {
        type: Number,
        required: false,
        default: 100,
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
    rowKey: {
        type: String,
        required: false,
        default: 'id',
    }
})

const emit = defineEmits(['sort', 'selectionChange'])

const selectedRows = ref<any[]>([])

const isAllSelected = computed(() => {
    if (!props.data.data || props.data.data.length === 0) return false
    return selectedRows.value.length === props.data.data.length
})

const handleSelectAll = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (target.checked) {
        selectedRows.value = [...props.data.data]
    } else {
        selectedRows.value = []
    }
    // emit('selectionChange', selectedRows.value.map(r => r[props.rowKey]))
    emit('selectionChange', selectedRows.value)
}

const handleRowSelect = (row: any) => {
    const rowKey = props.rowKey
    const index = selectedRows.value.findIndex(r => r[rowKey] == row[rowKey])

    if (index > -1) {
        selectedRows.value.splice(index, 1)
    } else {
        selectedRows.value.push(row)
    }
    // emit('selectionChange', selectedRows.value.map(r => r[rowKey]))
    emit('selectionChange', selectedRows.value)
}
</script>