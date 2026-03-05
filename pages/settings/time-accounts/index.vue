<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('timeAccounts.timeAccounts') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('timeAccounts.timeAccounts') }}</template>

            <ModulesUserSettingsTab />
            <ModulesUserSettingsCatalogSubTab id="sub-tab-catalog" class="mt-5" />

            <div class="mt-8">
                <div class="flex justify-between items-center mb-5 gap-2">
                    <template v-if="state.activeView === 'timeAccounts'">
                        <div></div>
                    </template>
                    <template v-else>
                        <FormButton buttonStyle="action" class="rounded-lg"
                            @click="state.activeView = 'timeAccounts', navigateTo('/settings/time-accounts')">
                            <Icon name="ph:arrow-left" class="h-4 w-4" aria-hidden="true" />
                        </FormButton>
                    </template>
                    <template v-if="state.activeView === 'timeAccounts'">
                        <div class="flex gap-2">
                            <FormButton buttonStyle="action" class="rounded-lg"
                                @click="state.activeView = 'templateAgreements'">
                                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('timeAccounts.templateAgreement') }}
                            </FormButton>
                            <FormButton buttonStyle="action" class="rounded-lg"
                                @click="navigateTo('/settings/time-accounts/new')">
                                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('timeAccounts.newTimeAccount') }}
                            </FormButton>
                        </div>
                    </template>
                    <template v-else>
                        <FormButton buttonStyle="action" class="rounded-lg"
                            @click="navigateTo('/settings/time-accounts/template-agreements/new')">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('timeAccounts.newTemplateAgreement') }}
                        </FormButton>
                    </template>
                </div>

                <!-- Time Accounts View -->
                <div v-if="state.activeView === 'timeAccounts'" class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearchTimeAccount" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.timeAccounts"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.timeAccounts?.data?.length === 0))">
                                <tr v-for="(timeAccount, index) in state.timeAccounts?.data" :key="index">
                                    <td>
                                        <span>{{ timeAccount?.name }}</span>
                                    </td>
                                    <td>
                                        <span>{{ timeAccount?.initial_amount }}</span>
                                    </td>
                                    <td>
                                        <span>{{ timeAccount?.start_date }}</span>
                                    </td>
                                    <td>
                                        <span>{{ timeAccount?.account_until }}</span>
                                    </td>
                                    <td>
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="openAssignModal(timeAccount)">
                                                <Icon name="ph:circles-four-light" class="size-4" />
                                                {{ $t('timeAccounts.table.actions.assign') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/settings/time-accounts/${timeAccount.uuid}/edit`)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('timeAccounts.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                @click="deleteTimeAccountConfirmation(timeAccount)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('timeAccounts.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.timeAccounts" @previous="previous" @next="next" />
                </div>

                <!-- Template Agreements View -->
                <div v-else class="space-y-5">
                    <Alert type="danger" :text="state?.templateAgreementError?.message"
                        v-if="state.templateAgreementError?.message && state.templateAgreementError.message.length > 0" />
                    <TableSearch @search="handleSearchTimeAccountAgreement" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.templateAgreementColumnHeaders" :data="state.templateAgreements"
                            :isLoading="state.isTemplateTableLoading">
                            <template #body
                                v-if="!(state.isTemplateTableLoading || (state.templateAgreements?.data?.length === 0))">
                                <tr v-for="(agreement, index) in state.templateAgreements?.data" :key="index">
                                    <td>
                                        <span>{{ agreement?.name }}</span>
                                    </td>
                                    <td>
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="openAssignTemplateModal(agreement)">
                                                <Icon name="ph:circles-four-light" class="size-4" />
                                                {{ $t('timeAccounts.templateAgreementsTable.actions.assign') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/settings/time-accounts/template-agreements/${agreement.uuid}/edit`)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('timeAccounts.templateAgreementsTable.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                @click="deleteTemplateAgreementConfirmation(agreement)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('timeAccounts.templateAgreementsTable.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.templateAgreements" @previous="previousTemplate" @next="nextTemplate" />
                </div>
            </div>

            <DialogConfirmation :isModalOpen="state.modal.isDeleteTimeAccountOpen"
                :message="$t('timeAccounts.table.confirmation.deleteTimeAccountConfirmation')"
                @close="state.modal.isDeleteTimeAccountOpen = false" @confirm="deleteTimeAccount" />

            <DialogConfirmation :isModalOpen="state.modal.isDeleteTemplateAgreementOpen"
                :message="$t('timeAccounts.templateAgreementsTable.confirmation.deleteConfirmation')"
                @close="state.modal.isDeleteTemplateAgreementOpen = false" @confirm="deleteTemplateAgreement" />

            <ModulesUserTimeAccountsModalAssignTarget :isModalOpen="state.modal.isAssignOpen"
                :selectedTimeAccount="state.selectedTimeAccount" @close="state.modal.isAssignOpen = false" />

            <ModulesUserTimeAccountsModalAssignTemplateTarget :isModalOpen="state.modal.isAssignTemplateOpen"
                :selectedTemplateAgreement="state.selectedTemplateAgreement"
                @close="state.modal.isAssignTemplateOpen = false" />

        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { timeAccountService } from '~/components/api/user/TimeAccountService'
import { timeAccountTemplateAgreementService } from '~/components/api/user/TimeAccountTemplateAgreementService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()

let currentTablePage = 1
let currentTemplatePage = 1

const breadcrumbLinks = [
    {
        name: 'timeAccounts.timeAccounts',
        translate: true,
        href: '/settings/time-accounts',
    },
]

const state = reactive({
    activeView: 'timeAccounts' as 'timeAccounts' | 'templateAgreements',
    timeAccounts: [] as any,
    templateAgreements: [] as any,
    columnHeaders: [
        { name: 'timeAccounts.table.name', isTranslateName: true, sorter: true, key: 'name' },
        { name: 'timeAccounts.table.initialAmount', isTranslateName: true, sorter: true, key: 'initial_amount' },
        { name: 'timeAccounts.table.startDate', isTranslateName: true, sorter: true, key: 'start_date' },
        { name: 'timeAccounts.table.expiryDate', isTranslateName: true, sorter: true, key: 'account_until' },
        { name: '' },
    ],
    templateAgreementColumnHeaders: [
        { name: 'timeAccounts.templateAgreementsTable.name', isTranslateName: true, sorter: false, key: 'name' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    templateAgreementError: {} as Error,
    isTableLoading: false,
    isTemplateTableLoading: false,
    selectedTimeAccount: {} as any,
    selectedTemplateAgreement: {} as any,
    modal: {
        isDeleteTimeAccountOpen: false,
        isAssignOpen: false,
        isDeleteTemplateAgreementOpen: false,
        isAssignTemplateOpen: false,
    },
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    setActiveViewFromQuery()
    fetchTimeAccounts()
    fetchTemplateAgreements()
})

function setActiveViewFromQuery() {
    const route = useRoute()
    if (route.query.view === 'templateAgreements') {
        state.activeView = 'templateAgreements'
    }
}

async function fetchTimeAccounts() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await timeAccountService.getTimeAccounts(params)
        if (response) {
            state.timeAccounts = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

async function fetchTemplateAgreements() {
    state.templateAgreementError = {}
    state.isTemplateTableLoading = true
    try {
        const params = {
            page: currentTemplatePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await timeAccountTemplateAgreementService.getTemplateAgreements(params)
        if (response) {
            state.templateAgreements = response
        }
    } catch (error: any) {
        state.templateAgreementError = error
    }
    state.isTemplateTableLoading = false
}

function previous() {
    currentTablePage--
    fetchTimeAccounts()
}

function next() {
    currentTablePage++
    fetchTimeAccounts()
}

function previousTemplate() {
    currentTemplatePage--
    fetchTemplateAgreements()
}

function nextTemplate() {
    currentTemplatePage++
    fetchTemplateAgreements()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchTimeAccounts()
}

function handleSearchTimeAccount(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchTimeAccounts()
}
function handleSearchTimeAccountAgreement(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchTemplateAgreements()
}

function deleteTimeAccountConfirmation(timeAccount: any) {
    state.selectedTimeAccount = timeAccount
    state.modal.isDeleteTimeAccountOpen = true
}

function openAssignModal(timeAccount: any) {
    state.selectedTimeAccount = timeAccount
    state.modal.isAssignOpen = true
}

async function deleteTimeAccount() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await timeAccountService.deleteTimeAccount(state.selectedTimeAccount.uuid)
        if (response) {
            state.modal.isDeleteTimeAccountOpen = false
            fetchTimeAccounts()
            successAlert(`${t('alert.success')}!`, `${t('timeAccounts.table.alert.timeAccountSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function deleteTemplateAgreementConfirmation(agreement: any) {
    state.selectedTemplateAgreement = agreement
    state.modal.isDeleteTemplateAgreementOpen = true
}

function openAssignTemplateModal(agreement: any) {
    state.selectedTemplateAgreement = agreement
    state.modal.isAssignTemplateOpen = true
}

async function deleteTemplateAgreement() {
    state.templateAgreementError = {}
    state.isTemplateTableLoading = true
    try {
        const response = await timeAccountTemplateAgreementService.deleteTemplateAgreement(state.selectedTemplateAgreement.uuid)
        if (response) {
            state.modal.isDeleteTemplateAgreementOpen = false
            fetchTemplateAgreements()
            successAlert(`${t('alert.success')}!`, `${t('timeAccounts.templateAgreementsTable.alert.successfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.templateAgreementError = error
    }
    state.isTemplateTableLoading = false
}
</script>
