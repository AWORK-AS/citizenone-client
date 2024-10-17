<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.walletTransactions.walletTransactions') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #header>{{ $t('citizens.walletTransactions.walletTransactions') }}</template>

            <div class="space-y-5">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    :to="`/citizens/${citizenUuid}/wallets`">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesCitizenDetailsHeader />
                <ModulesCitizenJournalTabs />

                <div>
                    <div class="mt-8 flex justify-end items-center mb-5 gap-x-2">
                        <FormButton buttonStyle="action" class="rounded-lg"
                            @click="state.modal.isAddWalletTransactionOpen = true">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('citizens.walletTransactions.newWalletTransaction') }}
                        </FormButton>
                    </div>
                </div>

                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch :columnFilter="state.columnFilter" :dataFilter="state.dataFilter"
                        @handleFilter="handleFilter" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.walletTransactions"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body
                                v-if="!(state.isTableLoading || (state.walletTransactions?.data?.length === 0))">
                                <tr v-for="(walletTransaction, index) in state.walletTransactions?.data" :key="index">
                                    <td width="40%">
                                        <span>{{ walletTransaction?.name }}</span>
                                    </td>
                                    <td width="40%">
                                        <span>{{ formatAmount(walletTransaction?.available_fund ?? 0) }}</span>
                                    </td>
                                    <td width="20%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/citizen/${citizenUuid}/walletTransactions/${walletTransaction?.uuid}`)">
                                                <Icon name="ph:eye" class="size-4" />
                                                {{ $t('citizens.walletTransactions.table.action.view') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="editWalletTransaction(walletTransaction)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('citizens.walletTransactions.table.action.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                @click="deleteWalletTransactionConfirmation(walletTransaction)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('citizens.walletTransactions.table.action.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.walletTransactions" @previous="previous" @next="next" />
                </div>
                <!-- <ModulesCitizenWalletTransactionModalNew :isModalOpen="state.modal.isAddWalletTransactionOpen"
                    @close="state.modal.isAddWalletTransactionOpen = false"
                    @refreshWalletTransactions="fetchWalletTransactions" />
                <ModulesCitizenWalletTransactionModalEdit :isModalOpen="state.modal.isEditWalletTransactionOpen"
                    :selectedWalletTransaction="state.selectedWalletTransaction"
                    @close="state.modal.isEditWalletTransactionOpen = false"
                    @refreshWalletTransactions="fetchWalletTransactions" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteWalletTransactionOpen"
                    :message="$t('citizens.walletTransactions.confirmation.deleteConfirmation') + '?'"
                    @close="state.modal.isDeleteWalletTransactionOpen = false" @confirm="deleteWalletTransaction" /> -->
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
// import { citizenWalletTransactionService } from '@/components/api/CitizenWalletTransactionService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid as any
const walletUuid = router?.currentRoute?.value?.params?.wallet_uuid as any
let currentTablePage = 1

const state = reactive({
    columnFilter: [
        { column: 'name' },
    ],
    columnHeaders: [
        { name: 'citizens.walletTransactions.table.cashIn', sorter: true, key: 'cash_in' },
        { name: 'citizens.walletTransactions.table.cashOut', sorter: true, key: 'cash_out' },
        { name: 'citizens.walletTransactions.table.file' },
        { name: 'citizens.walletTransactions.table.note' },
        { name: '' },
    ],
    walletTransactions: [] as any,
    dataFilter: [],
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isAddWalletTransactionOpen: false,
        isDeleteWalletTransactionOpen: false,
        isEditWalletTransactionOpen: false,
    },
    selectedWalletTransaction: [] as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchWalletTransactions()
})

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
        // const response = await citizenWalletTransactionService.getWalletTransactions(params)
        // if (response) {
        //     state.walletTransactions = response
        // }
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

function handleFilter(value: any) {
    currentTablePage = 1
    state.dataFilter = value
    fetchWalletTransactions()
}

function formatAmount(amount: any) {
    // Convert the number to a string with two decimal places
    let numberStr = parseFloat(amount).toFixed(2)

    // Split the string into integer and decimal parts
    let parts = numberStr.split('.')
    let integerPart = parts[0]
    let decimalPart = parts[1]

    // Add the thousands separators
    let formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

    // Combine the integer part with the decimal part
    return 'DKK ' + formattedIntegerPart + ',' + decimalPart
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
</script>