<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.salesCampaign.salesCampaign') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.salesCampaign.salesCampaign') }}</template>

            <div>
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg"
                        @click="navigateTo('/superadmin/sales-campaign/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('superadmin.salesCampaign.newCampaign') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.salesCampaigns"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body
                                v-if="!(state.isTableLoading || (state.salesCampaigns?.data?.length === 0))">
                                <tr v-for="(salesCampaign, index) in state.salesCampaigns?.data" :key="index">
                                    <td width="15%">
                                        <img :src="salesCampaign?.image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${salesCampaign?.title}`"
                                            class="w-full" />
                                    </td>
                                    <td width="20%">
                                        <div class="flex items-center gap-x-2">
                                            <span>{{ salesCampaign?.title }}</span>
                                        </div>
                                    </td>
                                    <td width="15%">
                                        <div class="flex items-center gap-x-2">
                                            <span class="cursor-pointer text-primary hover:text-tertiary-700"
                                                @click="navigateToExternalLink(salesCampaign?.link)">
                                                {{ salesCampaign?.link }}
                                            </span>
                                        </div>
                                    </td>
                                    <td width="30%">
                                        <span>{{ salesCampaign?.content }}</span>
                                    </td>
                                    <td width="20%">
                                        <div class="flex items-center gap-x-2">
                                            <Badge :type="salesCampaign?.is_active ? 'active' : 'primary'">
                                                <p class="text-xs">
                                                    {{ salesCampaign?.is_active ?
                                                        $t('superadmin.salesCampaign.table.active') :
                                                        $t('superadmin.salesCampaign.table.inactive') }}
                                                </p>
                                            </Badge>
                                        </div>
                                    </td>
                                    <td width="20%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/superadmin/sales-campaign/edit/${salesCampaign.uuid}`)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('superadmin.salesCampaign.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                @click="deleteConfirmation(salesCampaign)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('superadmin.salesCampaign.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.salesCampaigns" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeleteSalesCampaignOpen"
                :message="$t('superadmin.salesCampaign.confirmation.deleteConfirmation') + '?'"
                @close="state.modal.isDeleteSalesCampaignOpen = false" @confirm="deleteSalesCampaign" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { salesCampaignService } from '@/components/api/superadmin/SalesCampaignService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1

const state = reactive({
    columnHeaders: [
        { name: 'superadmin.salesCampaign.table.image', isTranslateName: true, },
        { name: 'superadmin.salesCampaign.table.title', isTranslateName: true, sorter: true, key: 'title' },
        { name: 'superadmin.salesCampaign.table.link', isTranslateName: true, },
        { name: 'superadmin.salesCampaign.table.content', isTranslateName: true, },
        { name: 'superadmin.salesCampaign.table.status', isTranslateName: true, sorter: true, key: 'is_active' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeleteSalesCampaignOpen: false
    },
    salesCampaigns: [] as any,
    selectedSalesCampaigns: [] as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchSalesCampaigns()
})

async function fetchSalesCampaigns() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await salesCampaignService.getSalesCampaigns(params)
        if (response) {
            state.salesCampaigns = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchSalesCampaigns()
}

function next() {
    currentTablePage++
    fetchSalesCampaigns()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchSalesCampaigns()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchSalesCampaigns()
}

async function navigateToExternalLink(link: any) {
    await navigateTo(link, {
        external: true,
        open: {
            target: '_blank',
        }
    })
}

function deleteConfirmation(salesCampaign: any) {
    state.selectedSalesCampaigns = salesCampaign
    state.modal.isDeleteSalesCampaignOpen = true
}

async function deleteSalesCampaign() {
    state.error = {}
    state.isTableLoading = true
    try {
        const salesCampaignUuid = state.selectedSalesCampaigns?.uuid
        const response = await salesCampaignService.deleteSalesCampaign(salesCampaignUuid)
        if (response) {
            fetchSalesCampaigns()
            successAlert(`${t('alert.success')}!`, `${t('superadmin.salesCampaign.form.alert.campaignSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>