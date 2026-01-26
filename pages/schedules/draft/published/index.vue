<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>
                    {{ customPagesStore.getCustomPagesName?.dutySchedules }}
                    {{ $t("dutySchedules.draftTemplates.draftTemplates")?.toLowerCase() }}
                    -
                    {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb>
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo('/schedules')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ customPagesStore.getCustomPagesName?.dutySchedules }}
                            </button>
                        </div>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo('/schedules/draft')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ $t('dutySchedules.draft.pageTitle') }}
                            </button>
                        </div>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo('/schedules/draft/templates')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                <span>
                                    {{ $t('dutySchedules.published.publishedVersions') }}
                                </span>
                            </button>
                        </div>
                    </template>
                </Breadcrumb>
            </template>

            <template #header>
                {{ $t('dutySchedules.published.publishedVersions') }}
            </template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/schedules/draft">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
            </div>

            <div class="flex-none lg:flex justify-between items-center space-y-3 mb-5">
                <div class="flex items-center gap-x-1">
                    <span>{{ $t('entriesPerPage') }}:</span>
                    <select class="focus:outline-none bg-transparent" @change="changePageLength"
                        id="employeesPageLength">
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

            <div class="space-y-5">
                <TableSearch @search="handleSearch" />

                <div class="table-responsive">
                    <Table :data="state.publishedVersions" :columnHeaders="state.columnHeaders"
                        :isLoading="state.isTableLoading" :sortData="publishedVersionsStore.getSortData" @sort="sort">
                        <template #body v-if="!(state.isTableLoading || (state.publishedVersions?.data?.length === 0))">
                            <tr v-for="publishedVersion in state.publishedVersions.data" :key="publishedVersion.uuid"
                                class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {{ $t('dutySchedules.published.version') }}-{{ publishedVersion.version_number }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {{ dateTimeFormatter.formatDateTimeToReadable(publishedVersion.created_at) }}
                                </td>
                                <td width="20%">
                                    <div class="flex items-end gap-2">
                                        <Tooltip :text="$t('dutySchedules.published.table.actions.view')">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/schedules/draft/published/${publishedVersion.uuid}/view-details`)">
                                                <Icon name="ph:eye" class="size-4" />
                                            </FormButton>
                                        </Tooltip>
                                    </div>
                                </td>
                            </tr>
                        </template>
                    </Table>
                </div>
                <Pagination :data="state.publishedVersions" @previous="previous" @next="next" />
            </div>

        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useCustomPagesStore } from "@/store/custom-pages";
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'
import { usePublishedVersionsStore } from "@/store/published-versions";
import { publishedVersionsService } from "~/components/api/user/PublishedVersionsService";

const runtimeConfig = useRuntimeConfig();
const customPagesStore = useCustomPagesStore() as any;
const publishedVersionsStore = usePublishedVersionsStore();
const { t } = useI18n()
const dateTimeFormatter = useDatetimeFormatter()

const state = reactive({
    columnHeaders: [
        { name: 'dutySchedules.published.table.versionNumber', isTranslateName: true, sorter: true, key: 'version_number' },
        { name: 'dutySchedules.published.table.dateCreated', isTranslateName: true, sorter: true, key: 'created_at' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    publishedVersions: [] as any,
    error: {} as Error,
    isTableLoading: false,
    selectedPublishedVersion: {} as any,
});

onMounted(() => {
    fetchPublishedVersions()
})

async function fetchPublishedVersions() {
    state.error = {}
    state.isTableLoading = true

    try {
        const params = {
            page_length: publishedVersionsStore.getCurrentPageLength,
            page_number: publishedVersionsStore.getCurrentPageNumber,
            sort_field: publishedVersionsStore.getSortData.sortField,
            sort_order: publishedVersionsStore.getSortData.sortOrder,
            ...state.dataFilter
        }
        const response = await publishedVersionsService.getPublishedVersions(params)
        if (response?.data) {
            state.publishedVersions = response
        }
    } catch (error: any) {
        state.error = error
    } finally {
        state.isTableLoading = false
    }
}

function previous() {
    const currentTablePage = publishedVersionsStore.getCurrentPageNumber - 1
    publishedVersionsStore.setCurrentPageNumber(currentTablePage)
    fetchPublishedVersions()
}

function next() {
    const currentTablePage = publishedVersionsStore.getCurrentPageNumber + 1
    publishedVersionsStore.setCurrentPageNumber(currentTablePage)
    fetchPublishedVersions()
}

function sort(sortingData: any) {
    publishedVersionsStore.setCurrentPageNumber(1)
    const sortField = sortingData.column
    const sortOrder = sortingData.sort
    publishedVersionsStore.setSortData(sortField, sortOrder)
    fetchPublishedVersions()
}

function handleSearch(value: any) {
    publishedVersionsStore.setCurrentPageNumber(1)
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchPublishedVersions()
}

function changePageLength(event: any) {
    publishedVersionsStore.setCurrentPageNumber(1)
    publishedVersionsStore.setCurrentPageLength(event.target.value)
    fetchPublishedVersions()
}

</script>