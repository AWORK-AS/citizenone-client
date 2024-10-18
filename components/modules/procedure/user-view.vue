<template>
    <div>
        <div class="flex justify-end md:justify-start">
            <div class="relative size-40">
                <svg class="size-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                    <!-- Background Circle -->
                    <circle cx="18" cy="18" r="16" fill="none" class="stroke-current text-gray-200 " stroke-width="2">
                    </circle>
                    <!-- Progress Circle -->
                    <circle cx="18" cy="18" r="16" fill="none" class="stroke-current text-primary" stroke-width="2"
                        stroke-dasharray="100" stroke-dashoffset="40" stroke-linecap="round"></circle>
                </svg>

                <!-- Percentage Text -->
                <div class="absolute top-1/2 start-1/2 transform -translate-y-1/2 -translate-x-1/2">
                    <span class="text-center text-2xl font-bold text-primary">60%</span>
                </div>
            </div>
        </div>
        <div class="mt-5 bg-white rounded-md ring-1 ring-inset ring-gray-200 divide-y divide-gray-200">
            <div class="p-5">
                <div>
                    <p class="font-semibold">Procedure 1</p>
                </div>
                <div class="mt-3 space-y-5">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-10 grid-re">
                        <div class="order-last lg:order-first">
                            <p class="text-sm">Task #1</p>
                            <p class="text-xs text-justify">
                                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum
                                has been the industry's standard dummy text ever since the 1500s, when an unknown
                                printer took a galley of type and scrambled it to make a type specimen book. It has
                                survived not only five centuries, but also the leap into electronic typesetting,
                                remaining essentially unchanged. It was popularised in the 1960s with the release of
                                Letraset sheets containing Lorem Ipsum passages, and more recently with desktop
                                publishing software like Aldus PageMaker including versions of Lorem Ipsum.
                            </p>
                        </div>
                        <div class="flex gap-x-3 whitespace-nowrap">
                            <div class="mt-2 flex w-full h-2.5 bg-gray-200 rounded-full overflow-hidden"
                                role="progressbar" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
                                <div class="flex flex-col justify-center rounded-full overflow-hidden bg-primary text-xs text-white text-center whitespace-nowrap transition duration-500"
                                    style="width: 0%"></div>
                            </div>
                            <div class="w-10 text-end">
                                <span class="text-sm text-gray-800">0%</span>
                            </div>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-10 grid-re">
                        <div class="order-last lg:order-first">
                            <p class="text-sm">Task #2</p>
                            <p class="text-xs text-justify">
                                Test description goes here...
                            </p>
                        </div>
                        <div class="flex gap-x-3 whitespace-nowrap">
                            <div class="mt-2 flex w-full h-2.5 bg-gray-200 rounded-full overflow-hidden"
                                role="progressbar" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
                                <div class="flex flex-col justify-center rounded-full overflow-hidden bg-primary text-xs text-white text-center whitespace-nowrap transition duration-500"
                                    style="width: 50%"></div>
                            </div>
                            <div class="w-10 text-end">
                                <span class="text-sm text-gray-800">25%</span>
                            </div>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-10 grid-re">
                        <div class="order-last lg:order-first">
                            <p class="text-sm">Task #3</p>
                            <p class="text-xs text-justify">
                                Test description goes here...
                            </p>
                        </div>
                        <div class="flex gap-x-3 whitespace-nowrap">
                            <div class="mt-2 flex w-full h-2.5 bg-gray-200 rounded-full overflow-hidden"
                                role="progressbar" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
                                <div class="flex flex-col justify-center rounded-full overflow-hidden bg-primary text-xs text-white text-center whitespace-nowrap transition duration-500"
                                    style="width: 50%"></div>
                            </div>
                            <div class="w-10 text-end">
                                <span class="text-sm text-gray-800">25%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="p-5">
                <div>
                    <p class="font-semibold">Procedure 2</p>
                </div>
                <div class="mt-3 space-y-5">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-10 grid-re">
                        <div class="order-last lg:order-first">
                            <p class="text-sm">Task #1</p>
                            <p class="text-xs text-justify">
                                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum
                                has been the industry's standard dummy text ever since the 1500s, when an unknown
                                printer took a galley of type and scrambled it to make a type specimen book. It has
                                survived not only five centuries, but also the leap into electronic typesetting,
                                remaining essentially unchanged. It was popularised in the 1960s with the release of
                                Letraset sheets containing Lorem Ipsum passages, and more recently with desktop
                                publishing software like Aldus PageMaker including versions of Lorem Ipsum.
                            </p>
                        </div>
                        <div class="flex gap-x-3 whitespace-nowrap">
                            <div class="mt-2 flex w-full h-2.5 bg-gray-200 rounded-full overflow-hidden"
                                role="progressbar" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
                                <div class="flex flex-col justify-center rounded-full overflow-hidden bg-primary text-xs text-white text-center whitespace-nowrap transition duration-500"
                                    style="width: 0%"></div>
                            </div>
                            <div class="w-10 text-end">
                                <span class="text-sm text-gray-800">0%</span>
                            </div>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-10 grid-re">
                        <div class="order-last lg:order-first">
                            <p class="text-sm">Task #2</p>
                            <p class="text-xs text-justify">
                                Test description goes here...
                            </p>
                        </div>
                        <div class="flex gap-x-3 whitespace-nowrap">
                            <div class="mt-2 flex w-full h-2.5 bg-gray-200 rounded-full overflow-hidden"
                                role="progressbar" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
                                <div class="flex flex-col justify-center rounded-full overflow-hidden bg-primary text-xs text-white text-center whitespace-nowrap transition duration-500"
                                    style="width: 50%"></div>
                            </div>
                            <div class="w-10 text-end">
                                <span class="text-sm text-gray-800">25%</span>
                            </div>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-10 grid-re">
                        <div class="order-last lg:order-first">
                            <p class="text-sm">Task #3</p>
                            <p class="text-xs text-justify">
                                Test description goes here...
                            </p>
                        </div>
                        <div class="flex gap-x-3 whitespace-nowrap">
                            <div class="mt-2 flex w-full h-2.5 bg-gray-200 rounded-full overflow-hidden"
                                role="progressbar" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
                                <div class="flex flex-col justify-center rounded-full overflow-hidden bg-primary text-xs text-white text-center whitespace-nowrap transition duration-500"
                                    style="width: 50%"></div>
                            </div>
                            <div class="w-10 text-end">
                                <span class="text-sm text-gray-800">25%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="p-5">
                <div>
                    <p class="font-semibold">Procedure 3</p>
                </div>
                <div class="mt-3 space-y-5">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-10 grid-re">
                        <div class="order-last lg:order-first">
                            <p class="text-sm">Task #1</p>
                            <p class="text-xs text-justify">
                                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum
                                has been the industry's standard dummy text ever since the 1500s, when an unknown
                                printer took a galley of type and scrambled it to make a type specimen book. It has
                                survived not only five centuries, but also the leap into electronic typesetting,
                                remaining essentially unchanged. It was popularised in the 1960s with the release of
                                Letraset sheets containing Lorem Ipsum passages, and more recently with desktop
                                publishing software like Aldus PageMaker including versions of Lorem Ipsum.
                            </p>
                        </div>
                        <div class="flex gap-x-3 whitespace-nowrap">
                            <div class="mt-2 flex w-full h-2.5 bg-gray-200 rounded-full overflow-hidden"
                                role="progressbar" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
                                <div class="flex flex-col justify-center rounded-full overflow-hidden bg-primary text-xs text-white text-center whitespace-nowrap transition duration-500"
                                    style="width: 0%"></div>
                            </div>
                            <div class="w-10 text-end">
                                <span class="text-sm text-gray-800">0%</span>
                            </div>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-10 grid-re">
                        <div class="order-last lg:order-first">
                            <p class="text-sm">Task #2</p>
                            <p class="text-xs text-justify">
                                Test description goes here...
                            </p>
                        </div>
                        <div class="flex gap-x-3 whitespace-nowrap">
                            <div class="mt-2 flex w-full h-2.5 bg-gray-200 rounded-full overflow-hidden"
                                role="progressbar" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
                                <div class="flex flex-col justify-center rounded-full overflow-hidden bg-primary text-xs text-white text-center whitespace-nowrap transition duration-500"
                                    style="width: 50%"></div>
                            </div>
                            <div class="w-10 text-end">
                                <span class="text-sm text-gray-800">25%</span>
                            </div>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-10 grid-re">
                        <div class="order-last lg:order-first">
                            <p class="text-sm">Task #3</p>
                            <p class="text-xs text-justify">
                                Test description goes here...
                            </p>
                        </div>
                        <div class="flex gap-x-3 whitespace-nowrap">
                            <div class="mt-2 flex w-full h-2.5 bg-gray-200 rounded-full overflow-hidden"
                                role="progressbar" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
                                <div class="flex flex-col justify-center rounded-full overflow-hidden bg-primary text-xs text-white text-center whitespace-nowrap transition duration-500"
                                    style="width: 50%"></div>
                            </div>
                            <div class="w-10 text-end">
                                <span class="text-sm text-gray-800">25%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { procedureService } from '@/components/api/ProcedureService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
let currentTablePage = 1

const state = reactive({
    columnFilter: [
        { column: 'title' },
    ],
    columnHeaders: [
        { name: 'procedures.table.title', sorter: true, key: 'title' },
        { name: 'procedures.table.content' },
        { name: 'procedures.table.status' },
        { name: '' },
    ],
    dataFilter: [],
    procedures: [] as any,
    error: {} as Error,
    isTableLoading: false,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchProcedures()
})

async function fetchProcedures() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await procedureService.getProcedures(params)
        if (response) {
            state.procedures = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchProcedures()
}

function next() {
    currentTablePage++
    fetchProcedures()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchProcedures()
}

function handleFilter(value: any) {
    currentTablePage = 1
    state.dataFilter = value
    fetchProcedures()
}
</script>