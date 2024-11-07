<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.wallets.wallets') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('citizens.wallets.wallets') }}</template>

            <div class="space-y-5">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesCitizenDetailsHeader />
                <ModulesCitizenJournalTabs />

                <div>
                    <div class="mt-8 flex justify-end items-center mb-5 gap-x-2">
                        <FormButton buttonStyle="action" class="rounded-lg" @click="state.modal.isAddWalletOpen = true">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('citizens.wallets.newWallet') }}
                        </FormButton>
                    </div>
                </div>

                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div>
                        <div class="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                            <div v-for="(wallet, index) in state.wallets?.data" :key="index"
                                @click="Object.keys(state.selectedWallet)?.length === 0 && navigateTo(`/citizens/${citizenUuid}/wallets/${wallet?.uuid}`)">
                                <div
                                    class="h-36 bg-white border-l-4 border-primary/70 px-4 py-5 relative overflow-clip ring-1 ring-gray-200 rounded-md cursor-pointer hover:bg-gray-100">
                                    <img src="/img/icons/asset-02.svg" alt="Image failed to load"
                                        class="z-10 w-24 absolute -bottom-8 -right-8">
                                    <div class="absolute z-30 right-2">
                                        <button class="hover:text-primar-800" @click="editWallet(wallet)">
                                            <Icon name="ph:pencil-simple" class="size-5" />
                                        </button>
                                    </div>
                                    <div class="space-y-1 relative z-20">
                                        <p class="text-sm font-semibold">{{ wallet?.name }}</p>
                                        <p class="text-xs">{{ formatAmount(wallet?.running_balance) }}</p>
                                        <p class="text-xxs text-justify line-clamp-5">{{ wallet?.note }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.wallets"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.wallets?.data?.length === 0))">
                                <tr v-for="(wallet, index) in state.wallets?.data" :key="index">
                                    <td width="20%">
                                        <span>{{ wallet?.name }}</span>
                                    </td>
                                    <td width="40%">
                                        <span>{{ wallet?.note }}</span>
                                    </td>
                                    <td width="20%">
                                        <span>{{ formatAmount(wallet?.running_balance ?? 0) }}</span>
                                    </td>
                                    <td width="20%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/citizens/${citizenUuid}/wallets/${wallet?.uuid}`)">
                                                <Icon name="ph:eye" class="size-4" />
                                                {{ $t('citizens.wallets.table.actions.view') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="editWallet(wallet)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('citizens.wallets.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                @click="deleteWalletConfirmation(wallet)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('citizens.wallets.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div> -->
                    <Pagination :data="state.wallets" @previous="previous" @next="next" />
                </div>
                <ModulesCitizenWalletModalNew :isModalOpen="state.modal.isAddWalletOpen"
                    @close="state.modal.isAddWalletOpen = false" @refreshWallets="fetchWallets" />
                <ModulesCitizenWalletModalEdit :isModalOpen="state.modal.isEditWalletOpen"
                    :selectedWallet="state.selectedWallet" @close="closeEditWalletModal"
                    @refreshWallets="fetchWallets" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteWalletOpen"
                    :message="$t('citizens.wallets.confirmation.deleteConfirmation') + '?'"
                    @close="state.modal.isDeleteWalletOpen = false" @confirm="deleteWallet" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { citizenWalletService } from '@/components/api/CitizenWalletService'
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
        { column: 'name' },
    ],
    columnHeaders: [
        { name: 'citizens.wallets.table.name', sorter: true, key: 'name' },
        { name: 'citizens.wallets.table.note' },
        { name: 'citizens.wallets.table.available', sorter: true, key: 'available' },
        { name: '' },
    ],
    wallets: [] as any,
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isAddWalletOpen: false,
        isDeleteWalletOpen: false,
        isEditWalletOpen: false,
    },
    selectedWallet: [] as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchWallets()
})

async function fetchWallets() {
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
        const response = await citizenWalletService.getWallets(params)
        if (response) {
            state.wallets = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchWallets()
}

function next() {
    currentTablePage++
    fetchWallets()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchWallets()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value
    fetchWallets()
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

function editWallet(wallet: any) {
    state.selectedWallet = wallet
    state.modal.isEditWalletOpen = true
}

function closeEditWalletModal() {
    state.selectedWallet = []
    state.modal.isEditWalletOpen = false
}

function deleteWalletConfirmation(wallet: any) {
    state.selectedWallet = wallet
    state.modal.isDeleteWalletOpen = true
}

async function deleteWallet() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await citizenWalletService.deleteWallet(state.selectedWallet.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchWallets()
            successAlert(`${t('alert.success')}!`, `${t('citizens.wallets.alert.deletedSuccessfully')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>