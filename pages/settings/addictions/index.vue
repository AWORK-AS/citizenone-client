<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('addictions.addictions') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('addictions.addictions') }}</template>

            <ModulesSettingsTab />
            <LazyModulesCustomPagesTab class="mt-5" />

            <div class="mt-8">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg" @click="navigateTo('/settings/addictions/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('addictions.newAddiction') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.addictions"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.addictions?.data?.length === 0))">
                                <tr v-for="(addiction, index) in state.addictions?.data" :key="index">
                                    <td width="50%">
                                        <span>{{ addiction?.name }}</span>
                                    </td>
                                    <td width="50%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/settings/addictions/edit/${addiction.uuid}`)">
                                                <Icon name="ph:pencil" class="size-4" />
                                                {{ $t('addictions.table.actions.edit') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.addictions" @previous="previous" @next="next" />
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { addictionService } from '@/components/api/AddictionService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
let currentTablePage = 1

const state = reactive({
    addictions: [] as any,
    columnFilter: [
        { column: 'name' },
    ],
    columnHeaders: [
        { name: 'addictions.table.name', sorter: true, key: 'name' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchAddictions()
})

async function fetchAddictions() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await addictionService.getAddictions(params)
        if (response) {
            state.addictions = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchAddictions()
}

function next() {
    currentTablePage++
    fetchAddictions()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchAddictions()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchAddictions()
}
</script>