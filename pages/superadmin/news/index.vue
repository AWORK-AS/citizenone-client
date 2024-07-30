<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.news.news') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.news.news') }}</template>

            <div>
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg" @click="navigateTo('/superadmin/news/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('superadmin.news.newNews') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch :columnFilter="state.columnFilter" :dataFilter="state.dataFilter"
                        @handleFilter="handleFilter" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.news" :isLoading="state.isTableLoading"
                            :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.news?.data?.length === 0))">
                                <tr v-for="(news, index) in state.news?.data" :key="index">
                                    <td width="20%">
                                        <img :src="news?.image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${news?.title}`"
                                            class="w-full" />
                                    </td>
                                    <td width="20%">
                                        <div class="flex items-center gap-x-2">
                                            <span>{{ news?.title }}</span>
                                        </div>
                                    </td>
                                    <td width="35%">
                                        <span>{{ news?.content }}</span>
                                    </td>
                                    <td width="20%">
                                        <div class="flex items-center gap-x-2">
                                            <Badge :type="news?.is_active ? 'active' : 'primary'">
                                                <p class="text-xs">
                                                    {{ news?.is_active ? $t('superadmin.news.table.active') :
                                                        $t('superadmin.news.table.inactive') }}
                                                </p>
                                            </Badge>
                                        </div>
                                    </td>
                                    <td width="20%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/superadmin/news/edit/${news.uuid}`)">
                                                <Icon name="ph:pencil" class="size-4" />
                                                {{ $t('superadmin.news.table.actions.edit') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.news" @previous="previous" @next="next" />
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { newsService } from '@/components/api/superadmin/NewsService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
let currentTablePage = 1

const state = reactive({
    columnFilter: [
        { column: 'title' },
        { column: 'status' },
    ],
    columnHeaders: [
        { name: 'superadmin.news.table.image' },
        { name: 'superadmin.news.table.title', sorter: true, key: 'title' },
        { name: 'superadmin.news.table.content' },
        { name: 'superadmin.news.table.status', sorter: true, key: 'is_active' },
        { name: '' },
    ],
    dataFilter: [],
    news: [] as any,
    error: {} as Error,
    isTableLoading: false,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchNews()
})

async function fetchNews() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await newsService.getNews(params)
        if (response) {
            state.news = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchNews()
}

function next() {
    currentTablePage++
    fetchNews()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchNews()
}

function handleFilter(value: any) {
    currentTablePage = 1
    state.dataFilter = value
    fetchNews()
}
</script>