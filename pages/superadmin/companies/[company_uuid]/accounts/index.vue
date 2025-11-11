<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.accounts.accounts') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.accounts.accounts') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/superadmin/companies">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesSuperadminCompanyTab />

                <div class="flex justify-end items-center mt-10 mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg"
                        @click="navigateTo(`/superadmin/companies/${companyUuid}/accounts/new`)">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('superadmin.accounts.newAccount') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.accounts"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.accounts?.data?.length === 0))">
                                <tr v-for="(account, index) in state.accounts?.data" :key="index">
                                    <td width="25%">
                                        <div class="flex items-center gap-x-2">
                                            <img :src="account?.image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${account?.firstname + ' ' + account?.lastname}`"
                                                class="rounded-full w-11" />
                                            <span>{{ account?.firstname }} {{ account?.lastname }}</span>
                                        </div>
                                    </td>
                                    <td width="20%">
                                        <span>{{ account?.email }}</span>
                                    </td>
                                    <td width="20%">
                                        <span>{{ account?.phone }}</span>
                                    </td>
                                    <td width="15%">
                                        <div class="flex items-center gap-x-2" v-for="(role, index) in account?.roles"
                                            :key="index">
                                            <span>{{ role.name }}</span>
                                        </div>
                                    </td>
                                    <td width="20%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/superadmin/companies/${companyUuid}/accounts/${account.uuid}/edit`)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('superadmin.accounts.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button"
                                                :buttonStyle="account.is_active ? 'danger' : 'success'"
                                                class="rounded-md" @click="activateDeactivateAccount(index, account)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ account.is_active ?
                                                    $t('superadmin.accounts.table.actions.deactivate') :
                                                    $t('superadmin.accounts.table.actions.activate') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                @click="confirmAccountDeletion(account)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('superadmin.accounts.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.accounts" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeleteAccountOpen"
                :message="$t('superadmin.accounts.confirmation.deleteConfirmation') + '?'"
                @close="state.modal.isDeleteAccountOpen = false" @confirm="deleteAccount" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { accountService } from '@/components/api/superadmin/AccountService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const companyUuid = router?.currentRoute?.value?.params?.company_uuid
let currentTablePage = 1

const state = reactive({
    accounts: [] as any,
    columnHeaders: [
        { name: 'superadmin.accounts.table.name', sorter: true, key: 'firstname' },
        { name: 'superadmin.accounts.table.email', sorter: true, key: 'email' },
        { name: 'superadmin.accounts.table.phone', sorter: true, key: 'phone' },
        { name: 'superadmin.accounts.table.role' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeleteAccountOpen: false,
    },
    selectedAccount: [] as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchAccounts()
})

async function fetchAccounts() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            company_uuid: companyUuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await accountService.getAccounts(params)
        if (response) {
            state.accounts = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchAccounts()
}

function next() {
    currentTablePage++
    fetchAccounts()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchAccounts()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchAccounts()
}

async function activateDeactivateAccount(index: number, account: any) {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            is_active: !account.is_active,
        }
        const response = await accountService.activateDeactiveAccount(account.uuid, params)
        if (response) {
            state.accounts.data[index].is_active = response?.data?.is_active
            if (response?.data?.is_active) {
                successAlert(`${t('alert.success')}!`, `${t('superadmin.accounts.form.alert.accountSuccessfullyActivated')}.`)
            } else {
                successAlert(`${t('alert.success')}!`, `${t('superadmin.accounts.form.alert.accountSuccessfullyDeactivated')}.`)
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function confirmAccountDeletion(account: any) {
    state.selectedAccount = account
    state.modal.isDeleteAccountOpen = true
}

async function deleteAccount() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await accountService.deleteAccount(state.selectedAccount.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchAccounts()
            successAlert(`${t('alert.success')}!`, `${t('superadmin.accounts.alert.deletedSuccessfully')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>