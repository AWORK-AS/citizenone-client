<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>
                    {{ $t('settings.licenseOverview.caseworkerLicenses') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('settings.licenseOverview.caseworkerLicenses') }}</template>

            <ModulesUserSettingsTab />

            <div v-if="userStore.getUser?.user_subscription === null">
                <div class="isolate mx-auto mt-8 grid max-w-lg">
                    <div class="bg-white ring-1 ring-gray-200 rounded-md p-8 xl:p-10">
                        <h3 class="text-xl font-semibold leading-7">
                            {{ $t('subscription.noSubscription.noActiveSubscription') }}
                        </h3>
                        <p class="mt-4 text-sm text-gray-600 leading-6">
                            {{
                                $t('subscription.noSubscription.itLooksLikeYouDontHaveAnActiveSubscriptionAtTheMoment')
                            }}.
                        </p>
                        <p class="mt-2 text-sm text-gray-600 leading-6">
                            {{ $t('subscription.noSubscription.toEnjoyOurFullRangeOfServicesAndBenefits') }}.
                        </p>
                        <div class="mt-6">
                            <FormButton type="button" buttonStyle="primary" class="w-full"
                                @click="navigateTo('/subscription/subscribe')">
                                {{ $t('subscription.noSubscription.subscribeNow') }}
                            </FormButton>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else>
                <div class="lg:flex gap-8">
                    <div class="isolate mt-8 w-full max-w-md">
                        <h3 class="py-3 text-sm font-semibold">
                            {{ $t('subscription.currentSubscription') }}
                        </h3>
                        <div class="bg-white ring-1 ring-gray-200 rounded-md p-8 xl:p-10">
                            <div class="flex items-center justify-between gap-x-4">
                                <h3 class="text-base font-semibold leading-7 text-tertiary">
                                    {{ userStore.getUser?.user_subscription?.deal?.name }}
                                </h3>
                            </div>
                            <p class="text-gray-600 mt-6 text-base leading-7">
                                <span v-if="userStore.getUser?.user_subscription?.deal?.name === 'Basis'">
                                    {{ $t('subscription.deal.perfectForLargerCompanies') }} 🚀
                                </span>
                                <span v-else>
                                    {{ $t('subscription.deal.goodForASmallTeam') }} 🤝
                                </span>
                            </p>
                            <p class="mt-4 flex items-baseline gap-x-2">
                                <span class="text-3xl font-bold tracking-tight text-gray-900">
                                    {{ userStore.getUser?.user_subscription?.type === 'monthly' ?
                                        formatAmount(userStore.getUser?.user_subscription?.deal?.monthly_price ?? 0) :
                                        formatAmount(userStore.getUser?.user_subscription?.deal?.yearly_price ?? 0) }}
                                </span>
                                <span class="text-base text-gray-500 lowercase">
                                    /{{ userStore.getUser?.user_subscription?.type === 'monthly' ?
                                        $t('subscription.deal.month') :
                                        $t('subscription.deal.year')
                                    }}
                                    {{ $t('excludeVat') }}
                                </span>
                            </p>
                            <ul role="list" class="mt-8 space-y-3 text-sm leading-6 text-gray-600 sm:mt-8">
                                <li class="flex gap-x-2">
                                    <Icon name="ph:check" class="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                                    {{ userStore.getUser?.user_subscription?.deal?.users }}
                                    <span v-if="userStore.getUser?.user_subscription?.deal?.users > 1">
                                        {{ $t('subscription.deal.users') }}
                                    </span>
                                    <span v-else>
                                        {{ $t('subscription.deal.user') }}
                                    </span>
                                </li>
                                <li class="flex gap-x-2">
                                    <Icon name="ph:check" class="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                                    {{ userStore.getUser?.user_subscription?.deal?.departments }}
                                    <span v-if="userStore.getUser?.user_subscription?.deal?.departments > 1">
                                        {{ customPagesStore.getCustomPagesName?.department ??
                                            $t('subscription.deal.departments') }}
                                    </span>
                                    <span v-else>
                                        {{ customPagesStore.getCustomPagesName?.department ??
                                            $t('subscription.deal.department') }}
                                    </span>
                                </li>
                                <li class="flex gap-x-2">
                                    <Icon name="ph:check" class="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                                    {{ $t('subscription.deal.unlimitedNumberOfCitizens') }}
                                </li>
                                <li class="flex gap-x-2">
                                    <Icon name="ph:check" class="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                                    {{ userStore.getUser?.user_subscription?.deal?.storage_size }}
                                    {{ $t('subscription.deal.storageSpace') }}
                                </li>
                                <li class="flex gap-x-2">
                                    <Icon name=" ph:check" class="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                                    <span v-if="userStore.getUser?.user_subscription?.deal?.name === 'Pro'">
                                        {{ $t('subscription.deal.telephoneSupport') }}
                                    </span>
                                    <span v-else>
                                        {{ $t('subscription.deal.chatSupport') }}
                                    </span>
                                </li>
                                <li class="flex gap-x-2"
                                    v-if="userStore.getUser?.user_subscription?.deal?.name === 'Pro'">
                                    <Icon name="ph:check" class="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                                    {{ $t('subscription.deal.automaticSynchronizationWithFMK') }}
                                </li>
                            </ul>
                            <div class="mt-8">
                                <FormButton type="button" buttonStyle="primary" class="w-full"
                                    @click="navigateTo('/subscription/subscribe')"
                                    v-if="!userStore.getUser?.user_subscription?.is_max">
                                    {{ $t('subscription.upgrade') }}
                                </FormButton>
                            </div>
                        </div>
                    </div>
                    <div class="mt-8 w-full">
                        <LoadingSpinner :isActive="state.isPageLoading">
                            <Alert type="danger" :text="state?.error?.message"
                                v-if="state.error?.message && state.error.message.length > 0" />
                            <div>
                                <h3 class="py-3 text-sm font-semibold">
                                    {{ $t('settings.licenseOverview.caseworkerLicenses') }}
                                </h3>
                                <ModulesUserSettingsLicenseOverviewSubTab />
                                <div class="bg-white ring-1 ring-gray-200 rounded-md p-8 xl:p-10 mt-4">
                                    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-5">
                                        <div>
                                            <p class="text-sm font-semibold text-gray-900">
                                                Manage caseworker sharing
                                            </p>
                                            <p class="text-sm text-gray-500">
                                                Configure which folders and reports are shared for each caseworker.
                                            </p>
                                        </div>
                                        <FormButton type="button" buttonStyle="primary"
                                            @click="navigateTo('/settings/subscription')">
                                            {{ $t('subscription.addOnDeals.purchaseExtraLicenses') }}
                                        </FormButton>
                                    </div>
                                    <TableSearch @search="handleSearch" />
                                    <div class="mt-5 table-responsive">
                                        <Table :columnHeaders="state.columnHeaders" :data="state.licenses"
                                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                                            <template #body
                                                v-if="!(state.isTableLoading || (state.licenses?.data?.length === 0))">
                                                <tr v-for="(license, index) in state.licenses?.data" :key="index">
                                                    <td width="60%">
                                                        <div class="flex flex-col gap-1">
                                                            <span class="font-semibold text-gray-900">
                                                                {{ displayCaseworkerName(license) }}
                                                            </span>
                                                            <span class="text-xs text-gray-500">
                                                                {{ $t('settings.licenseOverview.table.license') }}:
                                                                {{ license?.license }}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td width="40%">
                                                        <div class="flex items-center justify-end gap-2">
                                                            <Tooltip :text="$t('settings.licenseOverview.copyLink')">
                                                                <button type="button"
                                                                    class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-primary hover:text-primary hover:bg-primary/5"
                                                                    @click.prevent="copyShareLink(license)">
                                                                    <Icon name="ph:link-simple-horizontal" class="h-4 w-4" aria-hidden="true" />
                                                                </button>
                                                            </Tooltip>
                                                            <Tooltip text="Configure sharing">
                                                                <button type="button"
                                                                    class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-primary hover:text-primary hover:bg-primary/5"
                                                                    @click.prevent="openConfigureModal(license)">
                                                                    <Icon name="ph:gear-six" class="h-4 w-4" aria-hidden="true" />
                                                                </button>
                                                            </Tooltip>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </template>
                                        </Table>
                                    </div>
                                    <Pagination :data="state.licenses" @previous="previous" @next="next" />
                                </div>
                            </div>
                        </LoadingSpinner>
                    </div>
                </div>
            </div>

            <Modal size="lg" :show="state.modal.isConfigureOpen" title="Configure caseworker sharing"
                titleIcon="ph:gear-six" @close="closeConfigureModal">
                <template #modal-body>
                    <div class="space-y-5">
                        <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
                            <p class="text-sm font-semibold text-gray-900">
                                {{ displayCaseworkerName(state.selectedLicense) }}
                            </p>
                            <p class="mt-1 text-xs text-gray-500">
                                Pick a citizen first, then choose which folders should be shared from the hierarchical
                                citizen tree. Child files and folders are shown beneath each folder.
                            </p>
                        </div>

                        <div class="grid gap-4 sm:grid-cols-2">
                            <div>
                                <FormLabel for="caseworker-permission" label="Portal access" />
                                <select id="caseworker-permission" v-model="state.form.permission"
                                    class="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-primary">
                                    <option value="view">View</option>
                                    <option value="download">Download</option>
                                </select>
                            </div>

                            <div>
                                <FormLabel for="caseworker-citizen" label="Citizen" />
                                <FormSelect id="caseworker-citizen" :modelValue="state.selectedCitizenUuid"
                                    @update:modelValue="state.selectedCitizenUuid = $event" :options="state.citizens"
                                    class="mt-1" />
                            </div>
                        </div>

                        <div v-if="state.selectedCitizenUuid" class="space-y-3">
                            <div class="flex items-center justify-between gap-3">
                                <div>
                                    <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Shared folders from the citizen tree
                                    </p>
                                    <p class="text-sm text-gray-600">
                                        Select the folders that should be shared. Nested items stay visible under the
                                        chosen parent.
                                    </p>
                                </div>
                                <FormButton type="button" buttonStyle="outline" size="sm"
                                    :disabled="state.isTreeLoading" @click="loadCitizenTree()">
                                    Refresh tree
                                </FormButton>
                            </div>

                            <Alert type="danger" :text="state.error?.message"
                                v-if="state.error?.message && state.error.message.length > 0" />

                            <div class="rounded-xl border border-gray-200 bg-white p-4 max-h-[420px] overflow-y-auto">
                                <LoadingSpinner :isActive="state.isTreeLoading">
                                    <ModulesUserSettingsLicenseOverviewCitizenTree
                                        :nodes="state.citizenTree"
                                        :selectedIds="state.form.folderIds"
                                        :onToggleFolder="toggleFolderSelection"
                                    />
                                    <p v-if="!state.citizenTree?.length" class="text-sm text-gray-500">
                                        No files or folders were found for this citizen.
                                    </p>
                                </LoadingSpinner>
                            </div>

                            <div>
                                <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Selected folders</p>
                                <div class="mt-2 flex flex-wrap gap-2">
                                    <span v-for="folderId in state.form.folderIds" :key="folderId"
                                        class="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                        {{ folderId }}
                                    </span>
                                    <span v-if="!state.form.folderIds.length" class="text-sm text-gray-500">
                                        No folders selected yet.
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div v-else class="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500">
                            Choose a citizen to load the hierarchical files and folders.
                        </div>

                        <div class="flex items-center justify-end gap-2 pt-2">
                            <FormButton type="button" buttonStyle="cancel" @click="closeConfigureModal">
                                Cancel
                            </FormButton>
                            <FormButton type="button" buttonStyle="primary" :disabled="state.isSavingConfig"
                                @click="saveConfiguration">
                                {{ state.isSavingConfig ? 'Saving...' : 'Save changes' }}
                            </FormButton>
                        </div>
                    </div>
                </template>
            </Modal>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { citizenDocumentService } from '@/components/api/user/CitizenDocumentService'
import { citizenService } from '@/components/api/user/CitizenService'
import { licenseService } from '@/components/api/user/LicenseService'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useUserStore } from '@/store/user'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatAmount } = useAmountFormatter()
const customPagesStore = useCustomPagesStore() as any
const userStore = useUserStore() as any
const { successAlert, errorAlert } = useAlert()
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'settings.licenseOverview.caseworkerLicenses',
        translate: true,
        href: '/settings/license-overview/caseworker',
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'settings.licenseOverview.table.user', isTranslateName: true, sorter: true, key: 'license' },
        { name: 'actions', isTranslateName: false },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isPageLoading: false,
    isTableLoading: false,
    isSavingConfig: false,
    isTreeLoading: false,
    licenses: [] as any,
    citizens: [] as any[],
    citizenTree: [] as any[],
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
    modal: {
        isConfigureOpen: false,
    },
    selectedLicense: null as any,
    selectedCitizenUuid: null as any,
    form: {
        permission: 'view',
        folderIds: [] as number[],
    },
})

onMounted(() => {
    fetchLicenses()
    fetchCitizens()
})

watch(() => state.selectedCitizenUuid, () => {
    if (state.modal.isConfigureOpen && state.selectedCitizenUuid) {
        loadCitizenTree()
    }
})

async function fetchLicenses() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await licenseService.getCaseworkerLicenses(params)
        if (response) {
            state.licenses = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchLicenses()
}

function next() {
    currentTablePage++
    fetchLicenses()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchLicenses()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchLicenses()
}

async function fetchCitizens() {
    try {
        const response = await citizenService.getAllCitizens({ page: 1 })
        const citizens = response?.data ?? []
        state.citizens = citizens.map((citizen: any) => ({
            value: citizen.uuid,
            label: `${citizen.firstname ?? ''} ${citizen.lastname ?? ''}`.trim() || citizen.email || citizen.uuid,
        }))
    } catch (error: any) {
        state.error = error
    }
}

function displayCaseworkerName(license: any) {
    const user = license?.licensed_user
    if (!user) return license?.license || 'Caseworker'
    const name = `${user?.firstname ?? ''} ${user?.lastname ?? ''}`.trim()
    return name || license?.license || 'Caseworker'
}

function openConfigureModal(license: any) {
    state.selectedLicense = license
    state.form.permission = license?.caseworker_license_config?.permission || 'view'
    state.modal.isConfigureOpen = true

    if (!state.selectedCitizenUuid && state.citizens.length > 0) {
        state.selectedCitizenUuid = state.citizens[0]?.value || ''
    }

    state.form.folderIds = [...(license?.caseworker_license_config?.folders || [])]
}

function closeConfigureModal() {
    state.modal.isConfigureOpen = false
    state.selectedLicense = null
    state.form.permission = 'view'
    state.form.folderIds = []
    state.selectedCitizenUuid = ''
    state.citizenTree = []
}

function toggleFolderSelection(node: any, checked: boolean) {
    const folderId = Number(node?.id)
    if (!Number.isInteger(folderId)) return

    if (checked) {
        if (!state.form.folderIds.includes(folderId)) {
            state.form.folderIds.push(folderId)
        }
        return
    }

    state.form.folderIds = state.form.folderIds.filter((id) => id !== folderId)
}

async function fetchCitizenTreeItems(citizenUuid: string, folderUuid?: string): Promise<any[]> {
    const collectedItems: any[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
        const params: any = { citizen_uuid: citizenUuid, page }
        if (folderUuid) {
            params.folder_uuid = folderUuid
        }

        const response = await citizenDocumentService.getCitizenFileFolders(params)
        const pageItems = response?.data ?? []
        collectedItems.push(...pageItems)

        hasMore = !!response?.links?.next
        page += 1
    }

    return collectedItems
}

async function buildCitizenTree(citizenUuid: string, folderUuid?: string): Promise<any[]> {
    const items = await fetchCitizenTreeItems(citizenUuid, folderUuid)

    return Promise.all(items.map(async (item: any) => ({
        ...item,
        children: item?.type === 'folder' ? await buildCitizenTree(citizenUuid, item.uuid) : [],
    })))
}

async function loadCitizenTree() {
    if (!state.selectedCitizenUuid) return

    state.error = {}
    state.isTreeLoading = true
    try {
        state.citizenTree = await buildCitizenTree(state.selectedCitizenUuid)
    } catch (error: any) {
        state.error = error
    }
    state.isTreeLoading = false
}

async function saveConfiguration() {
    const subscriptionId = state.selectedLicense?.id
    const configId = state.selectedLicense?.caseworker_license_config?.id

    if (!subscriptionId || !configId) {
        errorAlert('Fejl', 'Caseworker configuration is not available')
        return
    }

    if (!state.selectedCitizenUuid) {
        errorAlert('Fejl', 'Choose a citizen before saving')
        return
    }

    state.isSavingConfig = true
    try {
        const currentFolderIds = state.selectedLicense?.caseworker_license_config?.folders || []
        const foldersToAdd = state.form.folderIds.filter((folderId) => !currentFolderIds.includes(folderId))
        const foldersToRemove = currentFolderIds.filter((folderId: number) => !state.form.folderIds.includes(folderId))

        await licenseService.updateCaseworkerLicenseConfig(subscriptionId, {
            permission: state.form.permission,
        })

        if (foldersToAdd.length > 0) {
            await licenseService.addCaseworkerFolders(subscriptionId, { folder_ids: foldersToAdd })
        }

        if (foldersToRemove.length > 0) {
            await licenseService.removeCaseworkerFolders(subscriptionId, { folder_ids: foldersToRemove })
        }

        successAlert('Gemt', 'Caseworker sharing updated')
        closeConfigureModal()
        await fetchLicenses()
    } catch (error: any) {
        errorAlert('Fejl', error?.message || 'Kunne ikke gemme konfigurationen')
    } finally {
        state.isSavingConfig = false
    }
}

async function copyShareLink(license: any) {
    try {
        const uuid = license?.caseworker_license_config?.share_link_uuid
        if (!uuid) {
            errorAlert('Fejl', 'Delingslink ikke tilgængeligt')
            return
        }

        const url = `${runtimeConfig.public.appBaseURL}/guest/caseworker/${uuid}`
        await navigator.clipboard.writeText(url)
        successAlert('Kopieret', 'Delingslink kopieret til udklipsholderen')
    } catch (e: any) {
        errorAlert('Fejl', e?.message || 'Kunne ikke kopiere linket')
    }
}
</script>