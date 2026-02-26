<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('bookingTags.bookingTags') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('bookingTags.bookingTags') }}</template>

            <ModulesUserSettingsTab />

            <ModulesUserSettingsCatalogSubTab id="sub-tab-catalog" class="mt-5" />

            <div class="mt-8">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg"
                        @click="navigateTo('/settings/booking-tags/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('bookingTags.addNewBookingTag') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.bookingTags"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.bookingTags?.data?.length === 0))">
                                <tr v-for="(bookingTag, index) in state.bookingTags?.data" :key="index">
                                    <td width="35%">
                                        <span>{{ bookingTag?.tag }}</span>
                                    </td>
                                    <td width="35%">
                                        <div class="text-xxs flex flex-wrap gap-1">
                                            <span v-for="(department, index) in bookingTag?.departments" :key=index
                                                class="bg-primary px-2 py-1 text-white rounded-md">
                                                {{ department?.name }}
                                            </span>
                                        </div>
                                    </td>
                                    <td width="30%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/settings/booking-tags/${bookingTag.uuid}/edit`)"
                                                v-if="bookingTag?.is_editable">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('bookingTags.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                @click="deleteBookingTagConfirmation(bookingTag)"
                                                v-if="bookingTag?.is_deletable">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('bookingTags.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.bookingTags" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeleteBookingTagOpen"
                :message="$t('bookingTags.table.confirmation.deleteBookingTagConfirmation') + '?'"
                @close="state.modal.isDeleteBookingTagOpen = false" @confirm="deleteBookingTag" />
        </NuxtLayout>
    </div>
</template>


<script setup lang="ts">
import { bookingTagService } from '@/components/api/user/BookingTagService'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const language = useI18n()
const customPagesStore = useCustomPagesStore() as any
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'bookingTags.bookingTags',
        translate: true,
        href: '/settings/bookingTags',
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'bookingTags.table.name', isTranslateName: true, sorter: true, key: 'tag' },
        { name: customPagesStore.getCustomPagesName?.department, isTranslateName: false },
        { name: '' }
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeleteBookingTagOpen: false,
    },
    pagination: {
        current_page: 1,
        last_page: 1,
        total: 0,
    },
    bookingTags: [] as any,
    selectedBookingTag: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchBookingTags()
})

watch(() => customPagesStore.getCustomPagesName, (newValue: any) => {
    if (newValue) {
        state.columnHeaders = [
            { name: 'bookingTags.table.name', isTranslateName: true, sorter: true, key: 'tag' },
            { name: customPagesStore.getCustomPagesName?.department, isTranslateName: false },
            { name: '' }
        ]
    }
}, { deep: true })

async function fetchBookingTags() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await bookingTagService.getBookingTags(params)
        if (response) {
            state.bookingTags = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchBookingTags()
}

function next() {
    currentTablePage++
    fetchBookingTags()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchBookingTags()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] === '' ? [] : value
    fetchBookingTags()
}

function deleteBookingTagConfirmation(bookingTag: any) {
    state.selectedBookingTag = bookingTag
    state.modal.isDeleteBookingTagOpen = true
}

async function deleteBookingTag() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await bookingTagService.deleteBookingTag(state.selectedBookingTag.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchBookingTags()
            successAlert(`${t('alert.success')}!`, `${t('bookingTags.alert.bookingTagSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
