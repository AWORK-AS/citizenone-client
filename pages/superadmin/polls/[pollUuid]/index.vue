<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.polls.pollItems') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.polls.pollItems') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/superadmin/polls">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg"
                        @click="navigateTo(`/superadmin/polls/${pollUuid}/new`)">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('superadmin.polls.newPollItem') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch :columnFilter="state.columnFilter" :dataFilter="state.dataFilter"
                        @handleFilter="handleFilter" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.pollItems"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.pollItems?.data?.length === 0))">
                                <tr v-for="(poll, index) in state.pollItems?.data" :key="index">
                                    <td width="40%">
                                        <div>
                                            {{ poll?.title }}
                                        </div>
                                    </td>
                                    <td width="30%">
                                        <div class="flex items-center gap-x-2">
                                            <Badge :type="poll?.is_active ? 'active' : 'primary'">
                                                <p class="text-xs">
                                                    {{ poll?.is_active ?
                                                        $t('superadmin.polls.table.active') :
                                                        $t('superadmin.polls.table.inactive') }}
                                                </p>
                                            </Badge>
                                        </div>
                                    </td>
                                    <td width="30%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/superadmin/polls/${pollUuid}/${poll.uuid}/edit`)">
                                                <Icon name="ph:pencil" class="size-4" />
                                                {{ $t('superadmin.polls.table.actions.edit') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.pollItems" @previous="previous" @next="next" />
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { pollItemService } from '@/components/api/superadmin/PollItemService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const pollUuid = router?.currentRoute?.value?.params?.pollUuid
let currentTablePage = 1

const state = reactive({
    columnFilter: [
        { column: 'title' },
        { column: 'status' },
    ],
    columnHeaders: [
        { name: 'superadmin.polls.table.title', sorter: true, key: 'title' },
        { name: 'superadmin.polls.table.status', sorter: true, key: 'is_active' },
        { name: '' },
    ],
    dataFilter: [],
    error: {} as Error,
    isTableLoading: false,
    pollItems: [] as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchPollItems()
})

async function fetchPollItems() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            poll_uuid: pollUuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await pollItemService.getPollItems(params)
        if (response) {
            state.pollItems = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchPollItems()
}

function next() {
    currentTablePage++
    fetchPollItems()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchPollItems()
}

function handleFilter(value: any) {
    currentTablePage = 1
    state.dataFilter = value
    fetchPollItems()
}
</script>