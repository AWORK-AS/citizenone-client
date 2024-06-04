<template>
    <div class="mb-6">
        <div
            class="bg-white flex items-center w-full flex-wrap mb-3 border border-primary relative px-3 py-1 rounded-md dark:bg-primary dark:border-slate-400">
            <span class="flex items-center gap-x-1 absolute text-gray-800 dark:text-white">
                <FunnelIcon class="w-4" /> <span>Filter</span>
            </span>
            <div class="flex flex-wrap flex-grow-0 ml-16">
                <div v-for="(filter, index) in state.filters" :key="index"
                    class="bg-primary flex items-center justify-center text-white rounded-full text-sm pl-3 pr-2 py-1 mx-1 dark:bg-sky-500">
                    {{ columnViewingFilter(filter.column) }}: {{ filter.value }}
                    <div class="cursor-pointer">
                        <XCircleIcon class="h-4 m-1" @click="deleteFilter(index)" />
                    </div>
                </div>
            </div>
            <input list="list" type="text" name="input" @keyup.enter="addFilter" @keyup.tab="addFilter"
                v-model="state.searchInput" autocomplete="off" class="
                    flex-grow
                    text-primary 
                    text-sm 
                    border-0
                    border-b-gray-300
                    outline-none
                    focus:outline-none
                    focus:ring-transparent
                    focus:border-primary
                    py-3
                    dark:bg-primary
                    dark:text-white" />
            <datalist id="list" class="appearance-none">
                <span v-for="column in props.columnFilter" :key="column.index">
                    <span v-if="column.filters">
                        <option v-for="filter in column.filters" :key="filter.index"
                            :value="filterValue(column.column) + filter.value" />
                    </span>
                    <span v-else>
                        <option :value="filterValue(column.column)" />
                    </span>
                </span>
            </datalist>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    FunnelIcon,
    XCircleIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps({
    columnFilter: {
        type: Object,
        required: true,
    },
    dataFilter: {
        type: Object,
        required: false,
    },
})

const state = reactive({
    filters: [],
    searchInput: null,
    tableFilter: [],
})

const emit = defineEmits(['handleFilter'])

watch(() => props.dataFilter, (newValue) => {
    if (newValue != null) {
        converToFilterValue(newValue)
    }
})

function addFilter(event: any) {
    let input = event.target.value.split(': ')
    if (input.length > 1 && event.target.value != '' && input[1].trim() != '') {
        // remove date suggestion format on dates column filters
        if (input[0].includes('(MM/DD/YYYY)')) {
            input[0] = input[0].replace('(MM/DD/YYYY)', '')
        }

        // remove first if there is an existing value of filter
        state.filters = state.filters.filter((data: any, index: Number) => data.column !== input[0])

        // Add the new filter
        state.filters.push({ 'column': input[0], 'value': input[1] })

        // data to be used in table/sql filter
        let tableFilter = { ...state.tableFilter }
        tableFilter[convertToTableNaming(input[0])] = input[1]
        state.tableFilter = tableFilter
        state.searchInput = ''
        emit('handleFilter', state.tableFilter)
    }
}

function deleteFilter(key: Number) {
    var item = state.filters.find((item, index) => index == key)
    state.filters = state.filters.filter((data, index) => index !== key)
    delete state.tableFilter[convertToTableNaming(item.column)]
    emit('handleFilter', state.tableFilter)
}


function filterValue(column: String) {
    let string = column.replaceAll('_', ' ')
    let wordList = string.split(" ")
    for (var count = 0; count < wordList.length; count++) {
        wordList[count] = wordList[count].charAt(0).toUpperCase() + wordList[count].slice(1)
    }
    string = wordList.join(" ")
    if (string.includes('Date')) {
        string = string + '(MM/DD/YYYY)'
    }
    return string + ": "
}

function convertToTableNaming(column: String) {
    var string = column.replaceAll(' ', '_')
    return string.toLowerCase()
}

function converToFilterValue(filterData: Object) {
    if (filterData) {
        var dataKeys = Object.keys(filterData)
        var final = dataKeys.map(function (x) {
            return {
                column: x,
                value: filterData[x],
            }
        })
        state.filters = final
    }
}

function columnViewingFilter(column: any) {
    let string = column.replaceAll('_', ' ')
    if (string.includes('(MM/DD/YYYY)')) {
        string = string.replace('(MM/DD/YYYY)', '')
    }
    return string.charAt(0).toUpperCase() + string.slice(1)
}

</script>

<style scoped>
input::-webkit-calendar-picker-indicator {
    display: none;
}
</style>