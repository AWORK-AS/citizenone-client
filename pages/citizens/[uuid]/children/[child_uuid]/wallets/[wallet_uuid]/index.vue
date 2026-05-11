<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.walletTransactions.walletTransactions') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

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

            <template #header>{{ $t('citizens.walletTransactions.walletTransactions') }}</template>

            <div class="space-y-5">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    :to="`/citizens/${citizenUuid}/children/${childUuid}/wallets`">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesUserCitizenChildDetailsHeader />
                <ModulesUserCitizenChildJournalTabs />

                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="mt-8 flex justify-between items-center mb-5 gap-x-2">
                        <div class="text-sm">
                            <p class="font-semibold">
                                {{ state.wallet?.data?.name }}
                            </p>
                            <p>
                                {{ $t('citizens.wallets.table.available') }}:
                                {{ formatAmount(state.wallet?.data?.running_balance) }}
                            </p>
                        </div>
                        <FormButton buttonStyle="action" @click="state.modal.isAddWalletTransactionOpen = true">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('citizens.walletTransactions.newWalletTransaction') }}
                        </FormButton>
                    </div>
                </LoadingSpinner>

                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.walletTransactions"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body
                                v-if="!(state.isTableLoading || (state.walletTransactions?.data?.length === 0))">
                                <tr v-for="(walletTransaction, index) in state.walletTransactions?.data" :key="index">
                                    <td width="20%">
                                        <span>{{ formatDateTimeToReadable(walletTransaction?.created_at) }}</span>
                                    </td>
                                    <td width="15%">
                                        <Badge type="cash-in" class="w-fit"
                                            v-if="walletTransaction?.type === 'cash_in'">
                                            {{ $t('citizens.walletTransactions.table.cashIn') }}
                                        </Badge>
                                        <Badge type="cash-out" class="w-fit"
                                            v-if="walletTransaction?.type === 'cash_out'">
                                            {{ $t('citizens.walletTransactions.table.cashOut') }}
                                        </Badge>
                                    </td>
                                    <td width="20%">
                                        <span v-if="walletTransaction?.type === 'cash_out'">(</span>
                                        <span>{{ formatAmount(walletTransaction?.amount ?? 0) }}</span>
                                        <span v-if="walletTransaction?.type === 'cash_out'">)</span>
                                    </td>
                                    <td width="30%">
                                        <div class="flex items-center gap-x-1" v-if="walletTransaction?.file?.file_url">
                                            <div class="text-tertiary hover:text-tertiary-700 cursor-pointer flex items-center gap-x-1"
                                                @click="openFile(walletTransaction?.file)">
                                                <Icon name="ph:file" class="size-4" />
                                                <span>
                                                    {{
                                                        $t('citizens.walletTransactions.table.openUploadDocument')
                                                    }}
                                                </span>
                                            </div>
                                            <Tooltip :text="$t('citizens.walletTransactions.table.actions.remove')">
                                                <Icon name="ph:trash" class="size-4 text-red-600 cursor-pointer"
                                                    @click="deleteWalletTransactionFileConfirmation(walletTransaction)" />
                                            </Tooltip>
                                        </div>
                                        <p class="mt-2">{{ walletTransaction?.note }}</p>
                                    </td>
                                    <td width="15%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action"
                                                @click="editWalletTransaction(walletTransaction)"
                                                v-if="walletTransaction?.is_editable">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('citizens.walletTransactions.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger"
                                                @click="deleteWalletTransactionConfirmation(walletTransaction)"
                                                v-if="walletTransaction?.is_deletable">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('citizens.walletTransactions.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.walletTransactions" @previous="previous" @next="next" />
                </div>
                <ModulesUserCitizenWalletTransactionModalNew :isModalOpen="state.modal.isAddWalletTransactionOpen"
                    @close="state.modal.isAddWalletTransactionOpen = false"
                    @refreshWalletTransactions="refreshWalletTransactions" />
                <ModulesUserCitizenWalletTransactionModalEdit :isModalOpen="state.modal.isEditWalletTransactionOpen"
                    :selectedWalletTranscation="state.selectedWalletTransaction"
                    @close="state.modal.isEditWalletTransactionOpen = false"
                    @refreshWalletTransactions="refreshWalletTransactions" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteWalletTransactionOpen"
                    :message="$t('citizens.walletTransactions.confirmation.deleteTransactionConfirmation') + '?'"
                    @close="state.modal.isDeleteWalletTransactionOpen = false" @confirm="deleteWalletTransaction" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteWalletTransactionFileOpen"
                    :message="$t('citizens.walletTransactions.confirmation.deleteFileConfirmation') + '?'"
                    @close="state.modal.isDeleteWalletTransactionFileOpen = false"
                    @confirm="deleteWalletTransactionFile" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useAmountFormatter } from '@/composables/amountFormatter'
import { citizenWalletService } from '@/components/api/user/CitizenWalletService'
import { citizenWalletTransactionService } from '@/components/api/user/CitizenWalletTransactionService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { useCustomPagesStore } from '@/store/custom-pages'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatAmount } = useAmountFormatter()
const { formatDateTimeToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
const customPagesStore = useCustomPagesStore() as any
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid as any
const childUuid = router?.currentRoute?.value?.params?.child_uuid as any
const walletUuid = router?.currentRoute?.value?.params?.wallet_uuid as any
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'citizens.tabs.children',
        translate: true,
        href: `/citizens/${citizenUuid}/children`,
    },
    {
        name: 'citizens.wallets.wallets',
        translate: true,
        href: `/citizens/${citizenUuid}/children/${childUuid}/wallets`,
    },
    {
        name: 'citizens.walletTransactions.walletTransactions',
        translate: true,
        href: `/citizens/${citizenUuid}/children/${childUuid}/wallets/${walletUuid}`,
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'citizens.walletTransactions.table.date', isTranslateName: true, sorter: true, key: 'date' },
        { name: 'citizens.walletTransactions.table.type', isTranslateName: true, sorter: true, key: 'type' },
        { name: 'citizens.walletTransactions.table.amount', isTranslateName: true, sorter: true, key: 'amount' },
        { name: 'citizens.walletTransactions.table.note', isTranslateName: true, },
        { name: '' },
    ],
    wallet: [] as any,
    walletTransactions: [] as any,
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isPageLoading: false,
    isTableLoading: false,
    modal: {
        isAddWalletTransactionOpen: false,
        isDeleteWalletTransactionOpen: false,
        isDeleteWalletTransactionFileOpen: false,
        isEditWalletTransactionOpen: false,
    },
    selectedWalletTransaction: [] as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchWallet()
    fetchWalletTransactions()
})

function refreshWalletTransactions() {
    fetchWallet()
    fetchWalletTransactions()
}

async function fetchWallet() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await citizenWalletService.getWallet(walletUuid)
        if (response) {
            state.wallet = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchWalletTransactions() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            wallet_uuid: walletUuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter,
        }
        const response = await citizenWalletTransactionService.getWalletTransactions(params)
        if (response) {
            state.walletTransactions = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchWalletTransactions()
}

function next() {
    currentTablePage++
    fetchWalletTransactions()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchWalletTransactions()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchWalletTransactions()
}

function openFile(document: any) {
    navigateTo(document?.file_url, {
        external: true,
        open: {
            target: '_blank',
        }
    })
}

function editWalletTransaction(walletTransaction: any) {
    state.selectedWalletTransaction = walletTransaction
    state.modal.isEditWalletTransactionOpen = true
}

function deleteWalletTransactionConfirmation(walletTransaction: any) {
    state.selectedWalletTransaction = walletTransaction
    state.modal.isDeleteWalletTransactionOpen = true
}

async function deleteWalletTransaction() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await citizenWalletTransactionService.deleteWalletTransaction(state.selectedWalletTransaction.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchWalletTransactions()
            successAlert(`${t('alert.success')}!`, `${t('citizens.walletTransactions.alert.deletedSuccessfully')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function deleteWalletTransactionFileConfirmation(walletTransaction: any) {
    state.selectedWalletTransaction = walletTransaction
    state.modal.isDeleteWalletTransactionFileOpen = true
}

async function deleteWalletTransactionFile() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await citizenWalletTransactionService.deleteWalletTransactionFile(state.selectedWalletTransaction.file.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchWalletTransactions()
            successAlert(`${t('alert.success')}!`, `${t('citizens.walletTransactions.alert.deletedFileSuccessfully')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>