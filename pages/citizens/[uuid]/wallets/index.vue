<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.wallets.wallets') }} - {{ runtimeConfig?.public?.appName }}</Title>
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

            <template #header>{{ $t('citizens.wallets.wallets') }}</template>

            <div class="space-y-5">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesUserCitizenDetailsHeader />
                <ModulesUserCitizenJournalTabs />
                <ModulesUserCitizenWalletTabs />

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
                    <Pagination :data="state.wallets" @previous="previous" @next="next" />
                </div>
                <ModulesUserCitizenWalletModalNew :isModalOpen="state.modal.isAddWalletOpen"
                    @close="state.modal.isAddWalletOpen = false" @refreshWallets="fetchWallets" />
                <ModulesUserCitizenWalletModalEdit :isModalOpen="state.modal.isEditWalletOpen"
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
import { citizenWalletService } from '@/components/api/user/CitizenWalletService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { useCustomPagesStore } from '@/store/custom-pages'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatAmount } = useAmountFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
const customPagesStore = useCustomPagesStore() as any
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid as any
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'citizens.wallets.wallets',
        translate: true,
        href: `/citizens/${citizenUuid}/wallets`,
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'citizens.wallets.table.name', isTranslateName: true, sorter: true, key: 'name' },
        { name: 'citizens.wallets.table.note', isTranslateName: true, },
        { name: 'citizens.wallets.table.available', isTranslateName: true, sorter: true, key: 'available' },
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
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchWallets()
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