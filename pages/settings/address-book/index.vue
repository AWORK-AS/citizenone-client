<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('addressBook.addressBook') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('addressBook.addressBook') }}</template>

            <ModulesUserSettingsTab />

            <ModulesUserSettingsCatalogSubTab id="sub-tab-catalog" class="mt-5" />

            <div class="mt-8">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" @click="state.modal.isNewContactOpen = true">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('addressBook.addNewContact') }}
                    </FormButton>
                </div>

                <div class="space-y-5">
                    <Alert type="danger" :text="state.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table
                            :columnHeaders="state.columnHeaders"
                            :data="state.contacts"
                            :isLoading="state.isTableLoading"
                            :sortData="state.sortData"
                            @sort="sort"
                        >
                            <template #body v-if="!(state.isTableLoading || (state.contacts?.data?.length === 0))">
                                <tr v-for="(contact, index) in state.contacts?.data" :key="index">
                                    <td>
                                        <span>{{ contact?.contact_job_title?.en_title }}</span>
                                    </td>
                                    <td>
                                        <span>{{ contact?.firstname }} {{ contact?.lastname }}</span>
                                    </td>
                                    <td>
                                        <span>{{ contact?.email ?? '—' }}</span>
                                    </td>
                                    <td>
                                        <span>{{ contact?.phone ?? '—' }}</span>
                                    </td>
                                    <td>
                                        <span>{{ contact?.assigned_citizens_count ?? 0 }}</span>
                                    </td>
                                    <td>
                                        <div class="flex items-center justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action" @click="openEditModal(contact)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('addressBook.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger" @click="deleteContactConfirmation(contact)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('addressBook.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.contacts" @previous="previous" @next="next" />
                </div>
            </div>

            <ModulesUserSettingsAddressBookModalNew
                :isModalOpen="state.modal.isNewContactOpen"
                @close="state.modal.isNewContactOpen = false"
                @refreshContacts="fetchContacts"
            />

            <ModulesUserSettingsAddressBookModalEdit
                v-if="state.selectedContact?.uuid"
                :isModalOpen="state.modal.isEditContactOpen"
                :selectedContact="state.selectedContact"
                @close="state.modal.isEditContactOpen = false"
                @refreshContacts="fetchContacts"
            />

            <DialogConfirmation
                :isModalOpen="state.modal.isDeleteContactOpen"
                :message="$t('addressBook.table.confirmation.deleteContactConfirmation') + '?'"
                @close="state.modal.isDeleteContactOpen = false"
                @confirm="deleteContact"
            />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { companyContactService } from '@/components/api/user/CompanyContactService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1

const breadcrumbLinks = [
    {
        name: 'addressBook.addressBook',
        translate: true,
        href: '/settings/address-book',
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'addressBook.table.jobTitle', isTranslateName: true, sorter: true, key: 'contact_job_title_id' },
        { name: 'addressBook.table.name', isTranslateName: true, sorter: true, key: 'firstname' },
        { name: 'addressBook.table.email', isTranslateName: true, sorter: false, key: 'email' },
        { name: 'addressBook.table.phone', isTranslateName: true, sorter: false, key: 'phone' },
        { name: 'addressBook.table.assignedCitizens', isTranslateName: true, sorter: false, key: '' },
        { name: '' },
    ],
    contacts: [] as any,
    dataFilter: {
        search: '',
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isNewContactOpen: false,
        isEditContactOpen: false,
        isDeleteContactOpen: false,
    },
    selectedContact: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchContacts()
})

async function fetchContacts() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter,
        }
        const response = await companyContactService.getContacts(params)
        if (response) {
            state.contacts = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchContacts()
}

function next() {
    currentTablePage++
    fetchContacts()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchContacts()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] === '' ? [] : value
    fetchContacts()
}

function openEditModal(contact: any) {
    state.selectedContact = contact
    state.modal.isEditContactOpen = true
}

function deleteContactConfirmation(contact: any) {
    state.selectedContact = contact
    state.modal.isDeleteContactOpen = true
}

async function deleteContact() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await companyContactService.deleteContact(state.selectedContact.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.' || response?.status === 204) {
            fetchContacts()
            successAlert(`${t('alert.success')}!`, `${t('addressBook.alert.contactSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.modal.isDeleteContactOpen = false
    state.isTableLoading = false
}
</script>
