<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.tabs.contacts') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('citizens.tabs.contacts') }}</template>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks">
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo('/citizens')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ customPagesStore.getCustomPagesName?.citizens }}
                            </button>
                        </div>
                    </template>
                </Breadcrumb>
            </template>

            <div class="space-y-5">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesUserCitizenDetailsHeader />
                <ModulesUserCitizenJournalTabs />

                <div>
                    <div class="mt-8 flex justify-end items-center mb-5 gap-x-2">
                        <FormButton buttonStyle="secondary" @click="state.modal.isAssignFromAddressBookOpen = true">
                            <Icon name="ph:address-book" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('addressBook.assignFromAddressBook') }}
                        </FormButton>
                        <FormButton buttonStyle="action" @click="state.modal.isAddContactOpen = true">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('citizens.contacts.newContact') }}
                        </FormButton>
                    </div>
                </div>

                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.contacts"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.contacts?.data?.length === 0))">
                                <tr v-for="(contact, index) in state.contacts?.data" :key="index">
                                    <td width="20%">
                                        <span>
                                            {{ language.locale.value === 'en' ? contact?.contact_job_title?.en_title :
                                                contact?.contact_job_title?.dk_title }}
                                        </span>
                                        <span v-if="contact?.contact_job_title?.system_name === 'relatives'">
                                            <Badge type="primary" class="w-fit mt-1" v-if="contact?.relationship">
                                                <p class="text-xxs px-2">
                                                    {{ contact?.relationship?.name }}
                                                </p>
                                            </Badge>
                                            <Badge type="primary" class="w-fit mt-1" v-if="contact?.has_system_access">
                                                <p class="text-xxs px-2 truncate">
                                                    {{ $t('citizens.contacts.table.allowSystemAccess') }}
                                                </p>
                                            </Badge>
                                        </span>
                                    </td>
                                    <td width="20%">
                                        <span>{{ contact?.firstname + ' ' }}</span>
                                        <span>{{ contact?.lastname }}</span>
                                    </td>
                                    <td width="20%">
                                        <div class="space-y-1">
                                            <div>{{ contact?.email }}</div>
                                        </div>
                                    </td>
                                    <td width="10%">
                                        <span>{{ contact?.phone }}</span>
                                    </td>
                                    <td width="20%">
                                        <span>{{ contact?.street }}</span>
                                        <span v-if="contact?.street">&nbsp;</span>
                                        <span>{{ contact?.region?.name }}</span>
                                        <span v-if="contact?.region?.name">, </span>
                                        <span>{{ contact?.municipality?.name }}</span>
                                        <span v-if="contact?.municipality?.name">, </span>
                                        <span>{{ contact?.city?.name }}</span>
                                        <span v-if="contact?.city?.name">&nbsp;</span>
                                        <span>{{ contact?.post_code }}</span>
                                    </td>
                                    <td width="10%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action"
                                                @click="editContact(contact)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('citizens.contacts.table.action.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger"
                                                @click="deleteContactConfirmation(contact)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('citizens.contacts.table.action.delete') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="primary" @click="sendEmail(contact)"
                                                v-if="contact?.email && userStore.getUser?.has_secure_mail_access">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('citizens.contacts.table.action.sendEmail') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.contacts" @previous="previous" @next="next" />
                </div>

                <div class="mt-10" v-if="state.addressBookContacts.length > 0 || state.isAddressBookLoading">
                    <h3 class="text-base font-semibold text-gray-700 mb-4">{{ $t('addressBook.assignedContacts') }}</h3>
                    <div class="table-responsive">
                        <Table :columnHeaders="state.addressBookColumnHeaders" :data="{ data: state.addressBookContacts }" :isLoading="state.isAddressBookLoading">
                            <template #body v-if="!(state.isAddressBookLoading || state.addressBookContacts.length === 0)">
                                <tr v-for="(contact, index) in state.addressBookContacts" :key="index">
                                    <td width="20%">
                                        <span>{{ language.locale.value === 'en' ? contact?.contact_job_title?.en_title : contact?.contact_job_title?.dk_title }}</span>
                                        <Badge type="info" class="w-fit mt-1 ml-1">
                                            <p class="text-xxs px-2">{{ $t('addressBook.addressBook') }}</p>
                                        </Badge>
                                    </td>
                                    <td width="20%">
                                        <span>{{ contact?.firstname }} {{ contact?.lastname }}</span>
                                    </td>
                                    <td width="20%">{{ contact?.email }}</td>
                                    <td width="10%">{{ contact?.phone }}</td>
                                    <td width="20%">
                                        <span>{{ contact?.street }}</span>
                                        <span v-if="contact?.street">&nbsp;</span>
                                        <span>{{ contact?.region?.name }}</span>
                                        <span v-if="contact?.region?.name">, </span>
                                        <span>{{ contact?.municipality?.name }}</span>
                                        <span v-if="contact?.municipality?.name">, </span>
                                        <span>{{ contact?.city?.name }}</span>
                                    </td>
                                    <td width="10%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="danger" @click="unassignAddressBookContact(contact)">
                                                <Icon name="ph:link-break" class="size-4" />
                                                {{ $t('addressBook.unassignContact') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                </div>

                <ModulesUserCitizenContactModalNew :isModalOpen="state.modal.isAddContactOpen"
                    @close="state.modal.isAddContactOpen = false" @refreshContacts="fetchContacts" />
                <ModulesUserCitizenContactModalEdit :isModalOpen="state.modal.isEditContactOpen"
                    :selectedContact="state.selectedContact" @close="state.modal.isEditContactOpen = false"
                    @refreshContacts="fetchContacts" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteContactOpen"
                    :message="$t('citizens.contacts.confirmation.deleteConfirmation') + '?'"
                    @close="state.modal.isDeleteContactOpen = false" @confirm="deleteContact" />
                <ModulesUserMailModalSendEmail :isModalOpen="state.modal.isSendEmailOpen"
                    :selectedContact="state.selectedContact" @close="state.modal.isSendEmailOpen = false" />
                <ModulesUserCitizenContactModalAssignAddressBook
                    :isModalOpen="state.modal.isAssignFromAddressBookOpen"
                    :citizenUuid="citizenUuid"
                    :assignedContacts="state.addressBookContacts"
                    @close="state.modal.isAssignFromAddressBookOpen = false"
                    @refreshAddressBookContacts="fetchAddressBookContacts"
                />
                <DialogConfirmation
                    :isModalOpen="state.modal.isUnassignAddressBookContactOpen"
                    :message="$t('addressBook.table.confirmation.unassignContactConfirmation') + '?'"
                    @close="state.modal.isUnassignAddressBookContactOpen = false"
                    @confirm="confirmUnassign"
                />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { citizenContactService } from '@/components/api/user/CitizenContactService'
import { citizenCompanyContactService } from '@/components/api/user/CitizenCompanyContactService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const language = useI18n()
const customPagesStore = useCustomPagesStore() as any
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid as any
const userStore = useUserStore() as any
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'citizens.tabs.contacts',
        translate: true,
        href: `/citizens/${citizenUuid}/contacts`,
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'citizens.contacts.table.title', isTranslateName: true, sorter: true, key: 'title' },
        { name: 'citizens.contacts.table.name', isTranslateName: true, },
        { name: 'citizens.contacts.table.email', isTranslateName: true, },
        { name: 'citizens.contacts.table.phone', isTranslateName: true, },
        { name: 'citizens.contacts.table.address', isTranslateName: true, },
        { name: '' },
    ],
    contacts: [] as any,
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isAddContactOpen: false,
        isDeleteContactOpen: false,
        isEditContactOpen: false,
        isSendEmailOpen: false,
        isAssignFromAddressBookOpen: false,
        isUnassignAddressBookContactOpen: false,
    },
    addressBookContacts: [] as any[],
    addressBookColumnHeaders: [
        { name: 'citizens.contacts.table.title', isTranslateName: true },
        { name: 'citizens.contacts.table.name', isTranslateName: true },
        { name: 'citizens.contacts.table.email', isTranslateName: true },
        { name: 'citizens.contacts.table.phone', isTranslateName: true },
        { name: 'citizens.contacts.table.address', isTranslateName: true },
        { name: '' },
    ],
    isAddressBookLoading: false,
    selectedAddressBookContact: null as any,
    selectedContact: [] as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchContacts()
    fetchAddressBookContacts()
})

async function fetchContacts() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            citizen_uuid: citizenUuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter,
        }
        const response = await citizenContactService.getContacts(params)
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
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchContacts()
}

function editContact(contact: any) {
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
        const response = await citizenContactService.deleteContact(state.selectedContact.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchContacts()
            successAlert(`${t('alert.success')}!`, `${t('citizens.contacts.alert.contactSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function sendEmail(contact: any) {
    state.selectedContact = contact
    state.modal.isSendEmailOpen = true
}

async function fetchAddressBookContacts() {
    state.isAddressBookLoading = true
    try {
        const response = await citizenCompanyContactService.getByCitizen(citizenUuid)
        if (response) {
            state.addressBookContacts = response?.data ?? response
        }
    } catch {}
    state.isAddressBookLoading = false
}

function unassignAddressBookContact(contact: any) {
    state.selectedAddressBookContact = contact
    state.modal.isUnassignAddressBookContactOpen = true
}

async function confirmUnassign() {
    try {
        await citizenCompanyContactService.unassign(citizenUuid, state.selectedAddressBookContact.uuid)
        successAlert(`${t('alert.success')}!`, `${t('addressBook.alert.contactSuccessfullyUnassigned')}.`)
        await fetchAddressBookContacts()
    } catch (error: any) {
        state.error = error
    }
    state.modal.isUnassignAddressBookContactOpen = false
}
</script>