<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.outcomes.outcomes') }} - {{ runtimeConfig?.public?.appName }}</Title>
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

            <template #header>{{ $t('citizens.outcomes.outcomes') }}</template>

            <div class="space-y-5">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesUserCitizenDetailsHeader />
                <ModulesUserCitizenJournalTabs />

                <div>
                    <div class="mt-8 flex justify-end items-center mb-5 gap-x-2">
                        <FormButton v-if="isAtLeast('Admin') || can('create_citizen_outcomes')" buttonStyle="action"
                            @click="state.modal.isNewOpen = true">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('citizens.outcomes.newOutcome') }}
                        </FormButton>
                    </div>
                </div>

                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.outcomes"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body
                                v-if="!(state.isTableLoading || (state.outcomes?.data?.length === 0))">
                                <tr v-for="(outcome, index) in state.outcomes?.data" :key="index">
                                    <td width="12%">
                                        <div v-if="outcome?.type === 'employment'"
                                            class="rounded-xl bg-blue-100 text-blue-800 px-2 py-1 text-xs font-semibold w-fit">
                                            {{ $t('citizens.outcomes.type.employment') }}
                                        </div>
                                        <div v-else-if="outcome?.type === 'education'"
                                            class="rounded-xl bg-green-100 text-green-800 px-2 py-1 text-xs font-semibold w-fit">
                                            {{ $t('citizens.outcomes.type.education') }}
                                        </div>
                                        <div v-else-if="outcome?.type === 'work_placement'"
                                            class="rounded-xl bg-amber-100 text-amber-800 px-2 py-1 text-xs font-semibold w-fit">
                                            {{ $t('citizens.outcomes.type.workPlacement') }}
                                        </div>
                                    </td>
                                    <td width="20%">
                                        <span>{{ outcome?.employer_institution }}</span>
                                    </td>
                                    <td width="12%">
                                        <span>{{ formatDateToReadable(outcome?.start_date) }}</span>
                                    </td>
                                    <td width="12%">
                                        <span>{{ outcome?.end_date ? formatDateToReadable(outcome.end_date) : '—' }}</span>
                                    </td>
                                    <td width="15%">
                                        <div class="flex items-center gap-x-2">
                                            <img :src="outcome?.user?.profile_image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${outcome?.user?.name}`"
                                                class="h-8 w-8 rounded-full bg-gray-50 object-cover" />
                                            <span>{{ outcome?.user?.name }}</span>
                                        </div>
                                    </td>
                                    <td width="15%">
                                        <span v-if="outcome?.billing_rule">{{ outcome.billing_rule.name }}</span>
                                        <span v-else class="text-gray-400">—</span>
                                    </td>
                                    <td width="14%">
                                        <div class="flex items-end gap-2">
                                            <Tooltip :text="$t('citizens.outcomes.edit')"
                                                v-if="isAtLeast('Admin') || can('update_citizen_outcomes')">
                                                <FormButton type="button" buttonStyle="action"
                                                    @click="editOutcome(outcome)">
                                                    <Icon name="ph:pencil-simple" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('citizens.outcomes.delete')"
                                                v-if="isAtLeast('Admin') || can('delete_citizen_outcomes')">
                                                <FormButton type="button" buttonStyle="danger"
                                                    @click="deleteOutcomeConfirmation(outcome)">
                                                    <Icon name="ph:trash" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.outcomes" @previous="previous" @next="next" />
                </div>

                <ModulesUserCitizenOutcomeModalNew :isModalOpen="state.modal.isNewOpen"
                    :citizenUuid="citizenUuid" @close="state.modal.isNewOpen = false"
                    @refreshOutcomes="fetchOutcomes" />
                <ModulesUserCitizenOutcomeModalEdit :isModalOpen="state.modal.isEditOpen"
                    :selectedOutcome="state.selectedOutcome" @close="state.modal.isEditOpen = false"
                    @refreshOutcomes="fetchOutcomes" />

                <DialogConfirmation :isModalOpen="state.modal.isDeleteOpen"
                    :message="$t('citizens.outcomes.confirmation.deleteConfirmation')"
                    @close="state.modal.isDeleteOpen = false" @confirm="deleteOutcome" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { citizenOutcomeService } from '@/components/api/user/CitizenOutcomeService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { useCustomPagesStore } from '@/store/custom-pages'
import { usePermissions } from '@/composables/usePermissions'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatDateToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
const customPagesStore = useCustomPagesStore() as any
const { isAtLeast, can } = usePermissions()
const userStore = useUserStore()
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid as any
let currentTablePage = 1

const breadcrumbLinks = [
    {
        name: 'citizens.outcomes.outcomes',
        translate: true,
        href: `/citizens/${citizenUuid}/outcomes`,
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'citizens.outcomes.table.type', isTranslateName: true, sorter: true, key: 'type' },
        { name: 'citizens.outcomes.table.employerInstitution', isTranslateName: true, sorter: true, key: 'employer_institution' },
        { name: 'citizens.outcomes.table.startDate', isTranslateName: true, sorter: true, key: 'start_date' },
        { name: 'citizens.outcomes.table.endDate', isTranslateName: true, sorter: false },
        { name: 'citizens.outcomes.table.consultant', isTranslateName: true, sorter: false },
        { name: 'citizens.outcomes.table.billingRule', isTranslateName: true, sorter: false },
        { name: '' },
    ],
    outcomes: [] as any,
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isNewOpen: false,
        isEditOpen: false,
        isDeleteOpen: false,
    },
    selectedOutcome: {} as any,
    sortData: {
        sortField: 'start_date',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    if (userStore.getUser?.company?.industry?.system_name !== 'employment_services') {
        navigateTo('/citizens')
        return
    }
    fetchOutcomes()
})

async function fetchOutcomes() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            citizen_uuid: citizenUuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
        }
        const response = await citizenOutcomeService.getOutcomes(params)
        if (response) {
            state.outcomes = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchOutcomes()
}

function next() {
    currentTablePage++
    fetchOutcomes()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchOutcomes()
}

function editOutcome(outcome: any) {
    state.selectedOutcome = outcome
    state.modal.isEditOpen = true
}

function deleteOutcomeConfirmation(outcome: any) {
    state.selectedOutcome = outcome
    state.modal.isDeleteOpen = true
}

async function deleteOutcome() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await citizenOutcomeService.deleteOutcome(state.selectedOutcome.uuid)
        if (response?.message) {
            state.modal.isDeleteOpen = false
            fetchOutcomes()
            successAlert(`${t('alert.success')}!`, `${t('citizens.outcomes.alert.deletedSuccessfully')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
