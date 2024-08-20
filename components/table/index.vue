<template>
    <table>
        <thead>
            <tr>
                <th v-for="(item, index) in props.columnHeaders" :key="index" :width="props.width">
                    <div class="flex items-center gap-x-2" :class="[
                        item.textAlign === 'left' && 'text-left',
                        item.textAlign === 'right' && 'text-right',
                        item.textAlign === 'center' && 'text-center']">
                        <p class="grow truncate">{{ item.name && $t(item.name) }}</p>
                        <div class="flex items-center justify-end" v-if="item.sorter">
                            <Icon name="heroicons:arrows-up-down"
                                class="h-5 w-5 cursor-pointer text-white hover:text-gray-200" aria-hidden="true"
                                v-show="item.key !== props?.sortData?.sortField"
                                @click="$emit('sort', { sort: 'ascend', column: item.key })" />
                            <Icon name="heroicons:arrow-down"
                                class="h-5 w-5 cursor-pointer text-white hover:text-gray-200" aria-hidden="true"
                                v-show="['ascend', null].includes(props?.sortData?.sortOrder) && item.key === props?.sortData?.sortField"
                                @click="$emit('sort', { sort: 'descend', column: item.key })" />
                            <Icon name="heroicons:arrow-up"
                                class="h-5 w-5 cursor-pointer text-white hover:text-gray-200" aria-hidden="true"
                                v-show="props?.sortData?.sortOrder == 'descend' && item.key === props?.sortData?.sortField"
                                @click="$emit('sort', { sort: null, column: null })" />
                        </div>
                    </div>
                </th>
            </tr>
        </thead>
        <tbody>
            <slot name="body"></slot>
            <tr v-if="props.isLoading || (props.data.data && props.data.data.length === 0)">
                <td :colspan="props.columnHeaders.length" class="text-center h-36">
                    <div class="flex items-center justify-center flex-col gap-2" v-if="props.isLoading">
                        <div class="w-16 h-16 border-b-2 border-gray-900 rounded-full animate-spin"></div>
                        Loading...
                    </div>
                    <div v-else>
                        {{ $t('theresNoDataAvailableToDisplay') }}.
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
    }
})
</script>