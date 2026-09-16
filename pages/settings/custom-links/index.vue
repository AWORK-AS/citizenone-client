<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('customSidebarLinks.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('customSidebarLinks.title') }}</template>

            <div class="mt-8">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" @click="navigateTo('/settings/custom-links/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('customSidebarLinks.addNew') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.links"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.links?.data?.length === 0))">
                                <tr v-for="(link, index) in state.links?.data" :key="index">
                                    <td width="30%">
                                        <div class="flex items-center gap-x-2">
                                            <Icon :name="link?.icon || 'ph:link'" class="size-4 text-gray-500" />
                                            <span>{{ link?.label }}</span>
                                        </div>
                                    </td>
                                    <td width="35%">
                                        <a :href="link?.url" target="_blank" rel="noopener"
                                            class="text-primary hover:text-primary-700 truncate">{{ link?.url }}</a>
                                    </td>
                                    <td width="15%">
                                        <Badge type="primary" class="w-fit">
                                            <p class="text-xxs px-1">{{ $t(`customSidebarLinks.visibility.${link?.visibility}`) }}</p>
                                        </Badge>
                                    </td>
                                    <td width="20%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action"
                                                @click="navigateTo(`/settings/custom-links/${link.uuid}/edit`)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('customSidebarLinks.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger"
                                                @click="deleteLinkConfirmation(link)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('customSidebarLinks.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.links" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeleteLinkOpen"
                :message="$t('customSidebarLinks.deleteConfirmation') + '?'"
                @close="state.modal.isDeleteLinkOpen = false" @confirm="deleteLink" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { customSidebarLinkService } from '@/components/api/user/CustomSidebarLinkService'
import { useCustomSidebarLinksStore } from '@/store/custom-sidebar-links'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const customSidebarLinksStore = useCustomSidebarLinksStore()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'customSidebarLinks.title',
        translate: true,
        href: '/settings/custom-links',
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'customSidebarLinks.table.label', isTranslateName: true, sorter: true, key: 'label' },
        { name: 'customSidebarLinks.table.url', isTranslateName: true },
        { name: 'customSidebarLinks.table.visibility', isTranslateName: true },
        { name: '' }
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeleteLinkOpen: false,
    },
    links: [] as any,
    selectedLink: {} as any,
    sortData: {
        sortField: 'sort_order',
        sortOrder: 'ascend',
    },
})

onMounted(() => {
    fetchLinks()
})

async function fetchLinks() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await customSidebarLinkService.getCustomSidebarLinks(params)
        if (response) {
            state.links = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchLinks()
}

function next() {
    currentTablePage++
    fetchLinks()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchLinks()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] === '' ? [] : value
    fetchLinks()
}

function deleteLinkConfirmation(link: any) {
    state.selectedLink = link
    state.modal.isDeleteLinkOpen = true
}

async function deleteLink() {
    state.error = {}
    state.isTableLoading = true
    try {
        await customSidebarLinkService.deleteCustomSidebarLink(state.selectedLink.uuid)
        state.modal.isDeleteLinkOpen = false
        await Promise.all([fetchLinks(), customSidebarLinksStore.fetchLinks()])
        successAlert(`${t('alert.success')}!`, `${t('customSidebarLinks.alert.deleted')}.`)
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
