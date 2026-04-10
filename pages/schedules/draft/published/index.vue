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
                    <NuxtLink class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors" to="/schedules/draft">
                        <Icon name="ph:arrow-left" size="16" />
                        <span>Tilbage til vagtplanskladden</span>
                    </NuxtLink>
                    <button onclick="document.getElementById('help-guide-modal').style.display='flex'"
                    class="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-primary hover:text-primary text-slate-500 text-xs font-semibold transition-all shadow-sm flex-shrink-0">
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Hjælp & Guide
                </button>
                <!-- Help Modal -->
                <div id="help-guide-modal" style="display:none;position:fixed;inset:0;z-index:9999;background:rgba(15,43,70,0.6);backdrop-filter:blur(4px);align-items:center;justify-content:center;" onclick="if(event.target===this)this.style.display='none'">
                    <div style="background:white;border-radius:20px;width:90vw;max-width:1100px;height:88vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 25px 80px rgba(0,0,0,0.35);">
                        <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 24px;border-bottom:1px solid #e2e8f0;flex-shrink:0;">
                            <div style="display:flex;align-items:center;gap:10px;">
                                <svg style="width:20px;height:20px;color:#0f4c75" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                                <span style="font-weight:600;color:#0f2b46;font-size:15px;">Hjælp & Guide — Vagtplan</span>
                            </div>
                            <button onclick="document.getElementById('help-guide-modal').style.display='none'" style="padding:8px;border-radius:8px;border:none;background:#f1f5f9;cursor:pointer;display:flex;align-items:center;color:#64748b;" title="Luk">
                                <svg style="width:18px;height:18px" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                        <iframe src="/vagtplan-guide.html" style="flex:1;border:none;width:100%;" title="Hjælp & Guide"></iframe>
                    </div>
                </div>
                </div>
                <!-- Forklaringsboks -->
                <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 mb-5">
                    <svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    <div>
                        <p class="text-sm font-semibold text-blue-900 mb-1">Tidligere publicerede vagtplaner</p>
                        <p class="text-sm text-blue-700">Her kan du se alle tidligere versioner af vagtplanen der er blevet offentliggjort. Klik på øje-ikonet for at se en version i detaljer. Disse versioner er skrivebeskyttede og kan ikke redigeres.</p>
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