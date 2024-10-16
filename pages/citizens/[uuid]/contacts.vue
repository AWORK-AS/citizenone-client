<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.tabs.contacts') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('citizens.tabs.contacts') }}</template>

            <div class="space-y-5">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesCitizenDetailsHeader />
                <ModulesCitizenJournalTabs />

                <div>
                    <div class="mt-8 flex justify-end items-center mb-5 gap-x-2">
                        <FormButton buttonStyle="action" class="rounded-lg"
                            @click="state.modal.isAddContactOpen = true">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('citizens.contacts.newContact') }}
                        </FormButton>
                    </div>
                </div>

                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch :columnFilter="state.columnFilter" :dataFilter="state.dataFilter"
                        @handleFilter="handleFilter" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.contacts"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.contacts?.data?.length === 0))">
                                <tr v-for="(contact, index) in state.contacts?.data" :key="index">
                                    <td width="15%">
                                        <span v-if="contact?.title === 'case_manager'">
                                            {{ $t('citizens.contacts.titles.caseManager') }}
                                        </span>
                                        <span v-if="contact?.title === 'dentist'">
                                            {{ $t('citizens.contacts.titles.dentist') }}
                                        </span>
                                        <span v-if="contact?.title === 'doctor'">
                                            {{ $t('citizens.contacts.titles.doctor') }}
                                        </span>
                                        <span v-if="contact?.title === 'external_contact'">
                                            {{ $t('citizens.contacts.titles.externalContact') }}
                                        </span>
                                        <span v-if="contact?.title === 'our_contact_person'">
                                            {{ $t('citizens.contacts.titles.ourContactPerson') }}
                                        </span>
                                        <span v-if="contact?.title === 'relatives'">
                                            {{ $t('citizens.contacts.titles.relatives') }}
                                        </span>
                                    </td>
                                    <td width="20%">
                                        <span>{{ contact?.firstname + ' ' }}</span>
                                        <span>{{ contact?.lastname }}</span>
                                    </td>
                                    <td width="15%">
                                        <span>{{ contact?.email }}</span>
                                    </td>
                                    <td width="10%">
                                        <span>{{ contact?.phone }}</span>
                                    </td>
                                    <td width="25%">
                                        <span>{{ contact?.street + ' ' }}</span>
                                        <span>{{ contact?.region?.name + ', ' }}</span>
                                        <span>{{ contact?.municipality?.name + ', ' }}</span>
                                        <span>{{ contact?.city?.name + ' ' }}</span>
                                        <span>{{ contact?.post_code }}</span>
                                    </td>
                                    <td width="15%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="editContact(contact)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('citizens.contacts.table.action.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                @click="deleteContactConfirmation(contact)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('citizens.contacts.table.action.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.contacts" @previous="previous" @next="next" />
                </div>
                <ModulesCitizenContactModalNew :isModalOpen="state.modal.isAddContactOpen"
                    @close="state.modal.isAddContactOpen = false" @refreshContacts="fetchContacts" />
                <ModulesCitizenContactModalEdit :isModalOpen="state.modal.isEditContactOpen"
                    :selectedContact="state.selectedContact" @close="state.modal.isEditContactOpen = false"
                    @refreshContacts="fetchContacts" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteContactOpen"
                    :message="$t('citizens.contacts.confirmation.deleteConfirmation') + '?'"
                    @close="state.modal.isDeleteContactOpen = false" @confirm="deleteContact" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { citizenContactService } from '@/components/api/CitizenContactService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid as any
let currentTablePage = 1

const state = reactive({
    columnFilter: [
        { column: 'title' },
        { column: 'name' },
    ],
    columnHeaders: [
        { name: 'citizens.contacts.table.title', sorter: true, key: 'title' },
        { name: 'citizens.contacts.table.name' },
        { name: 'citizens.contacts.table.email' },
        { name: 'citizens.contacts.table.phone' },
        { name: 'citizens.contacts.table.address' },
        { name: '' },
    ],
    contacts: [] as any,
    dataFilter: [],
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isAddContactOpen: false,
        isDeleteContactOpen: false,
        isEditContactOpen: false,
    },
    selectedContact: [] as any,
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

function handleFilter(value: any) {
    currentTablePage = 1
    state.dataFilter = value
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
</script>