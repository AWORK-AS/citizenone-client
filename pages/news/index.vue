<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('bulletBoard.bulletBoard') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('bulletBoard.bulletBoard') }}</template>

            <div>
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg" @click="navigateTo('/news/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('news.newNews') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.news" :isLoading="state.isTableLoading"
                            :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.news?.data?.length === 0))">
                                <tr v-for="(news, index) in state.news?.data" :key="index">
                                    <td width="15%">
                                        <img :src="news?.image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${news?.title}`"
                                            class="w-full" />
                                    </td>
                                    <td width="20%">
                                        <div class="flex items-center gap-x-2">
                                            <span>{{ news?.title }}</span>
                                        </div>
                                    </td>
                                    <td width="30%">
                                        <span class="line-clamp-4">{{ news?.content }}</span>
                                    </td>
                                    <td width="15%">
                                        <div class="flex items-center gap-x-2">
                                            <Badge :type="news?.is_featured ? 'active' : 'primary'">
                                                <p class="text-xs">
                                                    {{ news?.is_featured ? $t('news.table.active') :
                                                        $t('news.table.inactive') }}
                                                </p>
                                            </Badge>
                                        </div>
                                    </td>
                                    <td width="15%">
                                        <div class="flex items-center gap-x-2">
                                            <Badge :type="news?.is_active ? 'active' : 'inactive'">
                                                <p class="text-xs">
                                                    {{ news?.is_active ? $t('news.table.active') :
                                                        $t('news.table.inactive') }}
                                                </p>
                                            </Badge>
                                        </div>
                                    </td>
                                    <td width="20%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/news/${news.uuid}/edit`)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('news.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                @click="deleteConfirmation(news)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('news.table.actions.delete') }}
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
            <DialogConfirmation :isModalOpen="state.modal.isDeleteNewsOpen"
                :message="$t('news.confirmation.deleteConfirmation') + '?'"
                @close="state.modal.isDeleteNewsOpen = false" @confirm="deleteNews" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { newsService } from '@/components/api/user/NewsService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'bulletBoard.bulletBoard',
        translate: true,
        href: '/news',
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'news.table.image', isTranslateName: true, },
        { name: 'news.table.title', isTranslateName: true, sorter: true, key: 'title' },
        { name: 'news.table.content', isTranslateName: true, },
        { name: 'news.table.featured', isTranslateName: true, },
        { name: 'news.table.status', isTranslateName: true, sorter: true, key: 'is_active' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    news: [] as any,
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeleteNewsOpen: false
    },
    selectedNews: [] as any,
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

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchNews()
}

function deleteConfirmation(news: any) {
    state.selectedNews = news
    state.modal.isDeleteNewsOpen = true
}

async function deleteNews() {
    state.error = {}
    state.isTableLoading = true
    try {
        const newsUuid = state.selectedNews?.uuid
        const response = await newsService.deleteNews(newsUuid)
        if (response) {
            fetchNews()
            successAlert(`${t('alert.success')}!`, `${t('news.form.alert.newsSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>