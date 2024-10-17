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
                        <FormButton buttonStyle="action" class="rounded-lg"
                            @click="state.modal.isAddWalletTransactionOpen = true">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('citizens.walletTransactions.newWalletTransaction') }}
                        </FormButton>
                    </div>
                </LoadingSpinner>

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
                                    <td width="20%">
                                        <span>{{ formatDateTimeToReadable(walletTransaction?.created_at) }}</span>
                                    </td>
                                    <td width="20%">
                                        <div v-if="walletTransaction?.type === 'cash_in'">
                                            {{ $t('citizens.walletTransactions.table.cashIn') }}
                                        </div>
                                        <div v-else-if="walletTransaction?.type === 'cash_out'">
                                            {{ $t('citizens.walletTransactions.table.cashOut') }}
                                        </div>
                                    </td>
                                    <td width="30%">
                                        <span v-if="walletTransaction?.type === 'cash_out'">(</span>
                                        <span>{{ formatAmount(walletTransaction?.amount ?? 0) }}</span>
                                        <span v-if="walletTransaction?.type === 'cash_out'">)</span>
                                    </td>
                                    <td width="30%">
                                        <div class="text-tertiary hover:text-tertiary-700 cursor-pointer flex items-center gap-x-1"
                                            v-if="walletTransaction?.file?.file_url"
                                            @click="openFile(walletTransaction?.file)">
                                            <Icon name="ph:file" class="size-5" />
                                            <span>
                                                {{
                                                    $t('citizens.walletTransactions.table.openUploadDocument')
                                                }}
                                            </span>
                                        </div>
                                        <p class="mt-2">{{ walletTransaction?.note }}</p>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.walletTransactions" @previous="previous" @next="next" />
                </div>
                <ModulesCitizenWalletTransactionModalNew :isModalOpen="state.modal.isAddWalletTransactionOpen"
                    @close="state.modal.isAddWalletTransactionOpen = false"
                    @refreshWalletTransactions="refreshWalletTransactions" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { citizenWalletService } from '@/components/api/CitizenWalletService'
import { citizenWalletTransactionService } from '@/components/api/CitizenWalletTransactionService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatDateTimeToReadable } = useDatetimeFormatter()
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
        { name: 'citizens.walletTransactions.table.date', sorter: true, key: 'date' },
        { name: 'citizens.walletTransactions.table.type', sorter: true, key: 'type' },
        { name: 'citizens.walletTransactions.table.amount', sorter: true, key: 'amount' },
        { name: 'citizens.walletTransactions.table.note' },
    ],
    wallet: [] as any,
    walletTransactions: [] as any,
    dataFilter: [],
    error: {} as Error,
    isPageLoading: false,
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
</script>