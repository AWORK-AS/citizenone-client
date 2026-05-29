<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('employment.cases.cases') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks">
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo('/citizens')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ $t('citizens.citizens') }}
                            </button>
                        </div>
                    </template>
                </Breadcrumb>
            </template>

            <template #header>{{ $t('employment.cases.cases') }}</template>

            <div class="space-y-5">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesUserCitizenDetailsHeader />
                <ModulesUserCitizenJournalTabs />

                <LoadingSpinner :isActive="state.isTableLoading">
                    <div class="mt-8 space-y-3">
                        <div class="flex justify-end items-center">
                            <FormButton buttonStyle="action" @click="state.modal.isNewCaseOpen = true">
                                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('employment.cases.addNewCase') }}
                            </FormButton>
                        </div>
                        <div class="table-responsive">
                            <Table :columnHeaders="state.columnHeaders" :data="state.cases"
                                :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                                <template #body
                                    v-if="!(state.isTableLoading || (state.cases?.data?.length === 0))">
                                    <tr v-for="(employmentCase, index) in state.cases?.data" :key="index">
                                        <td width="15%">
                                            <span>{{ employmentCase?.agreement?.name }}</span>
                                        </td>
                                        <td width="15%">
                                            <span>{{ employmentCase?.agreement?.jobcenter?.name }}</span>
                                        </td>
                                        <td width="10%">
                                            <span>{{ employmentCase?.start_date }}</span>
                                        </td>
                                        <td width="10%">
                                            <span>{{ employmentCase?.calculated_end_date }}</span>
                                        </td>
                                        <td width="8%">
                                            <span>{{ employmentCase?.duration_weeks }}</span>
                                        </td>
                                        <td width="8%">
                                            <span>{{ employmentCase?.weeks_used }}</span>
                                        </td>
                                        <td width="10%">
                                            <span>{{ employmentCase?.status }}</span>
                                        </td>
                                        <td width="14%">
                                            <span>{{ employmentCase?.user?.name }}</span>
                                        </td>
                                        <td width="10%">
                                            <div class="flex items-end justify-end gap-2">
                                                <FormButton type="button" buttonStyle="action"
                                                    @click="openEditCase(employmentCase)">
                                                    <Icon name="ph:pencil-simple" class="size-4" />
                                                    {{ $t('employment.cases.table.actions.edit') }}
                                                </FormButton>
                                                <FormButton type="button" buttonStyle="danger"
                                                    @click="deleteCaseConfirmation(employmentCase)">
                                                    <Icon name="ph:trash" class="size-4" />
                                                    {{ $t('employment.cases.table.actions.delete') }}
                                                </FormButton>
                                            </div>
                                        </td>
                                    </tr>
                                </template>
                            </Table>
                        </div>
                        <Pagination :data="state.cases" @previous="previous" @next="next" />
                    </div>
                </LoadingSpinner>
            </div>

            <ModulesUserEmploymentCaseModalNew
                :isModalOpen="state.modal.isNewCaseOpen"
                :citizenUuid="citizenUuid"
                @close="state.modal.isNewCaseOpen = false"
                @refreshCases="fetchCases" />

            <ModulesUserEmploymentCaseModalEdit
                :isModalOpen="state.modal.isEditCaseOpen"
                :selectedCaseUuid="state.selectedCaseUuid"
                @close="state.modal.isEditCaseOpen = false"
                @refreshCases="fetchCases" />

            <DialogConfirmation :isModalOpen="state.modal.isDeleteOpen"
                :message="$t('employment.cases.table.confirmation.deleteCaseConfirmation')"
                @close="state.modal.isDeleteOpen = false" @confirm="deleteCase" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { employmentCaseService } from '@/components/api/user/EmploymentService'
import { useUserStore } from '@/store/user'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const userStore = useUserStore()
const route = useRoute()
const citizenUuid = route?.params?.uuid as string
let currentTablePage = 1

const breadcrumbLinks = [
    { name: 'employment.cases.cases', translate: true, href: `/citizens/${citizenUuid}/employment-cases` },
]

const state = reactive({
    cases: [] as any,
    columnHeaders: [
        { name: 'employment.cases.table.agreement', isTranslateName: true, sorter: false, key: 'agreement' },
        { name: 'employment.cases.table.jobcenter', isTranslateName: true, sorter: false, key: 'jobcenter' },
        { name: 'employment.cases.table.startDate', isTranslateName: true, sorter: true, key: 'start_date' },
        { name: 'employment.cases.table.endDate', isTranslateName: true, sorter: false, key: 'end_date' },
        { name: 'employment.cases.table.durationWeeks', isTranslateName: true, sorter: false, key: 'duration_weeks' },
        { name: 'employment.cases.table.weeksUsed', isTranslateName: true, sorter: false, key: 'weeks_used' },
        { name: 'employment.cases.table.status', isTranslateName: true, sorter: false, key: 'status' },
        { name: 'employment.cases.table.responsibleEmployee', isTranslateName: true, sorter: false, key: 'user' },
        { name: '' },
    ],
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isNewCaseOpen: false,
        isEditCaseOpen: false,
        isDeleteOpen: false,
    },
    selectedCaseUuid: '' as string,
    selectedCase: {} as any,
    sortData: { sortField: 'start_date', sortOrder: 'descend' },
})

onMounted(() => {
    if (userStore.getUser?.company?.industry?.system_name !== 'employment_services') {
        navigateTo('/citizens')
        return
    }
    fetchCases()
})

async function fetchCases() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await employmentCaseService.getCasesByCitizen(citizenUuid, {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
        })
        if (response) state.cases = response
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() { currentTablePage--; fetchCases() }
function next() { currentTablePage++; fetchCases() }

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = { sortField: sortingData.column, sortOrder: sortingData.sort }
    fetchCases()
}

function openEditCase(employmentCase: any) {
    state.selectedCaseUuid = employmentCase.uuid
    state.modal.isEditCaseOpen = true
}

function deleteCaseConfirmation(employmentCase: any) {
    state.selectedCase = employmentCase
    state.modal.isDeleteOpen = true
}

async function deleteCase() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await employmentCaseService.deleteCase(state.selectedCase.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchCases()
            successAlert(`${t('alert.success')}!`, `${t('employment.cases.table.alert.caseSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
