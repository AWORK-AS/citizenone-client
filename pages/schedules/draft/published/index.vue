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
                <div class="flex items-center justify-between mb-4">
                    <NuxtLink
                        class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors"
                        to="/schedules/draft">
                        <Icon name="ph:arrow-left" size="16" />
                        <span>{{ $t('dutySchedules.published.backToDraft') }}</span>
                    </NuxtLink>
                    <Tooltip :text="$t('helpGuide.askMiloTooltip')">
                        <button type="button" :aria-label="$t('helpGuide.askMiloTooltip')" @click="askMilo()"
                            class="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-primary hover:text-primary text-slate-500 text-xs font-semibold transition-all shadow-sm flex-shrink-0">
                            <Icon name="ph:chat-circle-dots" class="h-3.5 w-3.5" aria-hidden="true" />
                            {{ $t('helpGuide.askMilo') }}
                        </button>
                    </Tooltip>
                </div>
                <!-- Forklaringsboks -->
                <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 mb-5">
                    <svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                        <p class="text-sm font-semibold text-blue-900 mb-1">{{ $t('dutySchedules.published.infoBox.title') }}</p>
                        <p class="text-sm text-blue-700">{{ $t('dutySchedules.published.infoBox.description') }}</p>
                    </div>
                </div>

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
                                            <FormButton :aria-label="$t('dutySchedules.published.table.actions.view')" type="button" buttonStyle="action"
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


// Help on the duty schedule is Milo, answering from the help-desk articles.
// The static vagtplan-guide.html it replaces described a 2025 interface.
function askMilo() {
    useObiyenChat().revealAndOpenChat()
}
</script>