<template>
    <div>

        <Head>
            <Title>Citizens - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>

        <TairoContentWrapper>
            <template #right>
                <BaseButton color="primary" shape="full" @click="navigateTo('citizens/new')">
                    <Icon name="lucide:plus" class="h-4 w-4" />
                    <span>New Citizen</span>
                </BaseButton>
            </template>
            <div class="space-y-3">
                <BaseMessage color="danger" icon v-if="state.error" :message="state.error?.message" />
                <TableSearch :columnFilter="state.columnFilter" :dataFilter="state.dataFilter"
                    @handleFilter="handleFilter" />
                <div class="table-responsive">
                    <Table :columnHeaders="state.columnHeaders" :data="state.citizens" :isLoading="state.isTableLoading"
                        :sortData="state.sortData" @sort="sort">
                        <template #body v-if="!(state.isTableLoading || (state.citizens?.data?.length === 0))">
                            <tr v-for="(citizen, index) in state.citizens?.data" :key="index">
                                <td width="25%">
                                    <span>{{ citizen?.firstname }} {{ citizen?.lastname }}</span>
                                </td>
                                <td width="35%">
                                    <span>{{ citizen?.email }}</span>
                                </td>
                                <td width="20%">
                                    <span>{{ citizen?.phone }}</span>
                                </td>
                                <td width="20%">
                                    <div class="flex flex-wrap items-end gap-2">
                                        <BaseButtonIcon rounded="md" data-nui-tooltip="View citizen details"
                                            :to="`/citizens/details/${citizen.uuid}`">
                                            <Icon name="ph:eye" class="size-5 text-sky-500" />
                                        </BaseButtonIcon>
                                        <BaseButtonIcon rounded="md" data-nui-tooltip="Edit citizen"
                                            :to="`/citizens/edit/${citizen.uuid}`">
                                            <Icon name="ph:pencil-simple" class="size-5 text-sky-500" />
                                        </BaseButtonIcon>
                                        <BaseButtonIcon rounded="md" data-nui-tooltip="Show citizen note">
                                            <Icon name="ph:note-blank" class="size-5 text-sky-500" />
                                        </BaseButtonIcon>
                                    </div>
                                </td>
                            </tr>
                        </template>
                    </Table>
                </div>
                <Pagination :data="state.citizens" @previous="previous" @next="next" />
                <div v-if="!state.citizens?.data">
                    <BasePlaceholderPage title="No data available" subtitle="There is no data to show you right now.">
                        <template #image>
                            <img class="block dark:hidden"
                                src="/img/illustrations/placeholders/flat/placeholder-projects.svg"
                                alt="Placeholder image" />
                            <img class="hidden dark:block"
                                src="/img/illustrations/placeholders/flat/placeholder-projects-dark.svg"
                                alt="Placeholder image" />
                        </template>
                    </BasePlaceholderPage>
                </div>
            </div>
        </TairoContentWrapper>
    </div>
</template>

<script setup lang="ts">
import { citizenService } from '@/components/api/CitizenService'

definePageMeta({
    layout: 'user',
    title: 'Citizens',
})

const runtimeConfig = useRuntimeConfig()
let currentTablePage = 1

const state = reactive({
    columnFilter: [
        { column: 'name' },
        { column: 'email' },
        { column: 'phone' },
    ],
    columnHeaders: [
        { name: 'Name', sorter: true, key: 'firstname' },
        { name: 'Email', sorter: true, key: 'email' },
        { name: 'Phone', sorter: true, key: 'phone' },
        { name: '' },
    ],
    dataFilter: [],
    error: null,
    isTableLoading: false,
    citizens: [],
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchCitizens()
})

async function fetchCitizens() {
    state.isTableLoading = true
    state.error = null
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await citizenService.getCitizens(params)
        if (response) {
            state.citizens = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchCitizens()
}

function next() {
    currentTablePage++
    fetchCitizens()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchCitizens()
}

function handleFilter(value: any) {
    currentTablePage = 1
    state.dataFilter = value
    fetchCitizens()
}
</script>