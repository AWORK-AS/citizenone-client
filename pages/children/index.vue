<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('children.children') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb>
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo('/citizens')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ customPagesStore.getCustomPagesName?.citizens }}
                            </button>
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400 ml-4"
                                aria-hidden="true" />
                            <span class="ml-4 text-sm font-medium text-gray-500">
                                {{ $t('children.children') }}
                            </span>
                        </div>
                    </template>
                </Breadcrumb>
            </template>

            <template #header>
                {{ $t('children.children') }}
            </template>

            <div>
                <div
                    class="flex justify-between items-start flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
                    <div class="flex items-center gap-x-3">
                        <span
                            v-if="departmentStore.getSelectedDepartmentName && departmentStore.getSelectedDepartmentName !== 'All departments'"
                            class="inline-flex items-center gap-x-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-sm font-medium">
                            <Icon name="ph:buildings" class="h-4 w-4" aria-hidden="true" />
                            {{ departmentStore.getSelectedDepartmentName }}
                        </span>
                        <div class="flex items-center gap-x-1 text-sm text-slate-500">
                            <span>{{ $t('entriesPerPage') }}:</span>
                            <select class="focus:outline-none bg-transparent" @change="changePageLength"
                                id="childrenPageLength">
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="30">30</option>
                                <option value="40">40</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                                <option value="500">500</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="flex items-baseline gap-2" v-if="state.children">
                        <span class="text-2xl font-bold tracking-tight text-primary">
                            <CountUp :value="Number(state.children?.total ?? state.children?.data?.length ?? 0)" />
                        </span>
                        <span class="text-sm font-medium text-slate-500">{{ $t('children.children') }}</span>
                    </div>
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.children"
                            :isLoading="state.isTableLoading" :sortData="childrenStore.getSortData" @sort="sort"
                            :emptyMessage="$t('children.table.empty')">
                            <template #body v-if="!(state.isTableLoading || (state.children?.data?.length === 0))">
                                <tr v-for="(child, index) in state.children?.data" :key="index">
                                    <td width="20%">
                                        <span>{{ child?.firstname }} {{ child?.lastname }}</span>
                                    </td>
                                    <td width="25%">
                                        <CitizenHoverCard v-if="child?.citizen?.uuid" :uuid="child.citizen.uuid"
                                            :preset="child.citizen">
                                            <NuxtLink :to="`/citizens/${child.citizen.uuid}/children`"
                                                class="text-primary hover:text-primary-hover">
                                                {{ child?.citizen?.firstname }} {{ child?.citizen?.lastname }}
                                            </NuxtLink>
                                        </CitizenHoverCard>
                                    </td>
                                    <td width="20%">
                                        <p v-if="child?.email">{{ child?.email }}</p>
                                    </td>
                                    <td width="15%">
                                        <span>{{ child?.social_security_number }}</span>
                                    </td>
                                    <td width="10%">
                                        <span>{{ child?.phone }}</span>
                                    </td>
                                    <td width="10%">
                                        <div class="flex items-center justify-end gap-1.5">
                                            <Tooltip :text="$t('children.table.actions.view')" v-if="child?.citizen?.uuid">
                                                <FormButton type="button" buttonStyle="action" buttonSize="xs"
                                                    @click="navigateTo(`/citizens/${child.citizen.uuid}/children/${child.uuid}/journals`)">
                                                    <Icon name="ph:eye" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.children" @previous="previous" @next="next" />
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { citizenChildService } from '@/components/api/user/CitizenChildService'
import { useDepartmentStore } from '@/store/department'
import { useCitizenChildrenStore } from '@/store/citizen-children'
import { useCustomPagesStore } from '@/store/custom-pages'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const departmentStore = useDepartmentStore() as any
const childrenStore = useCitizenChildrenStore() as any
const customPagesStore = useCustomPagesStore() as any

const state = reactive({
    columnHeaders: [
        { name: 'children.table.name', isTranslateName: true, sorter: true, key: 'firstname' },
        { name: 'children.table.parent', isTranslateName: true, sorter: true, key: 'parent_name' },
        { name: 'children.table.emailAddress', isTranslateName: true, sorter: true, key: 'email' },
        { name: 'children.table.ssn', isTranslateName: true, sorter: true, key: 'social_security_number' },
        { name: 'children.table.phone', isTranslateName: true, sorter: true, key: 'phone' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    children: [] as any,
})

onMounted(() => {
    fetchChildren()
})

watch(() => departmentStore.getSelectedDepartmentName, (newValue: any) => {
    if (newValue != null) {
        fetchChildren()
    }
})

async function fetchChildren() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            department: departmentStore.getSelectedDepartmentName,
            page: childrenStore.getCurrentPageNumber,
            page_length: childrenStore.getCurrentPageLength,
            sortField: childrenStore.getSortData.sortField,
            sortOrder: childrenStore.getSortData.sortOrder,
            ...state.dataFilter
        }
        const response = await citizenChildService.getCitizenChildren(params)
        if (response) {
            state.children = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    childrenStore.setCurrentPageNumber(childrenStore.getCurrentPageNumber - 1)
    fetchChildren()
}

function next() {
    childrenStore.setCurrentPageNumber(childrenStore.getCurrentPageNumber + 1)
    fetchChildren()
}

function sort(sortingData: any) {
    childrenStore.setCurrentPageNumber(1)
    childrenStore.setSortData(sortingData.column, sortingData.sort)
    fetchChildren()
}

function handleSearch(value: any) {
    childrenStore.setCurrentPageNumber(1)
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchChildren()
}

function changePageLength(event: any) {
    childrenStore.setCurrentPageNumber(1)
    childrenStore.setCurrentPageLength(event.target.value)
    fetchChildren()
}
</script>
