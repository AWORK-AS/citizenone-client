<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>
                    {{ $t('referrals.referrals') }}
                    -
                    {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>
                {{ $t('referrals.referrals') }}
            </template>

            <div>
                <div class="flex justify-between items-center mb-5">
                    <div class="flex items-center gap-x-1">
                        <span>{{ $t('entriesPerPage') }}:</span>
                        <select class="focus:outline-none bg-transparent" @change="changePageLength"
                            id="referralsPageLength">
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="30">30</option>
                            <option value="40">40</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                            <option value="500">500</option>
                        </select>
                    </div>
                    <div class="flex items-center gap-x-3">
                        <div class="w-44">
                            <FormSelect :options="statusOptions" :placeholder="$t('referrals.status')"
                                :searchable="false" v-model="state.dataFilter.status"
                                @update:modelValue="handleStatusFilter" />
                        </div>
                        <FormButton buttonStyle="action" @click="openNewModal"
                            v-if="can('create_referral')">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('referrals.newReferral') }}
                        </FormButton>
                    </div>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.referrals"
                            :isLoading="state.isTableLoading" :sortData="referralStore.getSortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.referrals?.data?.length === 0))">
                                <tr v-for="(referral, index) in state.referrals?.data" :key="index">
                                    <td width="18%">
                                        <span v-if="referral?.citizen">
                                            {{ referral.citizen.firstname }} {{ referral.citizen.lastname }}
                                        </span>
                                    </td>
                                    <td width="12%">
                                        <span>{{ referral?.municipality }}</span>
                                    </td>
                                    <td width="15%">
                                        <span>{{ referral?.caseworker_name }}</span>
                                    </td>
                                    <td width="10%">
                                        <span>{{ formatDateToReadable(referral?.start_date) }}</span>
                                    </td>
                                    <td width="10%">
                                        <span>{{ formatDateToReadable(referral?.end_date) }}</span>
                                        <span v-if="referral?.weeks" class="text-gray-400 text-xxs block">
                                            {{ referral.weeks }} {{ $t('referrals.weeks') }}
                                        </span>
                                    </td>
                                    <td width="10%">
                                        <span v-if="referral?.department">{{ referral.department.name }}</span>
                                    </td>
                                    <td width="10%">
                                        <Badge
                                            :type="referral?.status === 'active' ? 'active' : referral?.status === 'pending' ? 'pending' : 'inactive'"
                                            class="w-fit">
                                            <p class="text-xxs">
                                                {{ referral?.status === 'active' ? $t('referrals.statusActive') :
                                                    referral?.status === 'pending' ? $t('referrals.statusPending') :
                                                    $t('referrals.statusClosed') }}
                                            </p>
                                        </Badge>
                                    </td>
                                    <td width="15%">
                                        <div class="flex items-end justify-end gap-2">
                                            <Tooltip :text="$t('referrals.table.actions.view')">
                                                <FormButton type="button" buttonStyle="action"
                                                    @click="viewReferral(referral)">
                                                    <Icon name="ph:eye" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('referrals.table.actions.edit')"
                                                v-if="can('update_referral')">
                                                <FormButton type="button" buttonStyle="action"
                                                    @click="editReferral(referral)">
                                                    <Icon name="ph:pencil-simple" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('referrals.table.actions.delete')" v-if="can('delete_referral')">
                                                <FormButton type="button" buttonStyle="danger"
                                                    @click="deleteConfirmation(referral)">
                                                    <Icon name="ph:trash" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.referrals" @previous="previous" @next="next" />
                </div>
            </div>

            <ModulesUserReferralModalNew :isModalOpen="state.modal.isAddReferralOpen"
                @close="state.modal.isAddReferralOpen = false" @refreshReferrals="fetchReferrals" />
            <ModulesUserReferralModalView :isModalOpen="state.modal.isViewReferralOpen"
                :selectedReferralUuid="state.selectedReferralUuid"
                @close="state.modal.isViewReferralOpen = false" />
            <ModulesUserReferralModalEdit :isModalOpen="state.modal.isEditReferralOpen"
                :selectedReferralUuid="state.selectedReferralUuid"
                @close="state.modal.isEditReferralOpen = false" @refreshReferrals="fetchReferrals" />

            <DialogConfirmation :isModalOpen="state.modal.isDeleteReferralOpen"
                :message="$t('referrals.deleteReferralConfirm')"
                @close="state.modal.isDeleteReferralOpen = false" @confirm="deleteReferral" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { referralService } from '@/components/api/user/ReferralService'
import { useReferralStore } from '@/store/referral'
import { useDepartmentStore } from '@/store/department'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { usePermissions } from '@/composables/usePermissions'
import { useI18n } from 'vue-i18n'
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const referralStore = useReferralStore() as any
const departmentStore = useDepartmentStore()
const { formatDateToReadable } = useDatetimeFormatter()
const { isAtLeast, can } = usePermissions()
const { successAlert } = useAlert()
const { t } = useI18n()

const breadcrumbLinks = [
    {
        name: 'referrals.referrals',
        translate: true,
        href: `/referrals`,
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'referrals.table.citizen', isTranslateName: true, sorter: false },
        { name: 'referrals.table.municipality', isTranslateName: true, sorter: true, key: 'municipality' },
        { name: 'referrals.table.caseworker', isTranslateName: true, sorter: true, key: 'caseworker_name' },
        { name: 'referrals.table.startDate', isTranslateName: true, sorter: true, key: 'start_date' },
        { name: 'referrals.table.endDate', isTranslateName: true, sorter: true, key: 'end_date' },
        { name: 'department.department', isTranslateName: true, sorter: false },
        { name: 'referrals.table.status', isTranslateName: true, sorter: true, key: 'status' },
        { name: '' },
    ],
    dataFilter: {
        search: '',
        status: null as string | null,
    },
    error: {} as Error,
    isTableLoading: false,
    referrals: [] as any,
    modal: {
        isAddReferralOpen: false,
        isViewReferralOpen: false,
        isEditReferralOpen: false,
        isDeleteReferralOpen: false,
    },
    selectedReferralUuid: '' as string,
})

const statusOptions = computed(() => [
    { value: 'active', label: t('referrals.statusActive') },
    { value: 'pending', label: t('referrals.statusPending') },
    { value: 'closed', label: t('referrals.statusClosed') },
])

onMounted(() => {
    fetchReferrals()
})

watch(() => departmentStore.getSelectedDepartmentName, (newValue: any) => {
    if (newValue != null) {
        fetchReferrals()
    }
})

async function fetchReferrals() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params: any = {
            department_uuid: departmentStore.getSelectedDepartment?.uuid === 'all-departments' ? '' : departmentStore.getSelectedDepartment?.uuid,
            page: referralStore.getCurrentPageNumber,
            per_page: referralStore.getCurrentPageLength,
            sortField: referralStore.getSortData.sortField,
            sortOrder: referralStore.getSortData.sortOrder,
        }
        if (state.dataFilter.search) params.search = state.dataFilter.search
        if (state.dataFilter.status) params.status = state.dataFilter.status
        const response = await referralService.getReferrals(params)
        if (response) {
            state.referrals = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    referralStore.setCurrentPageNumber(referralStore.getCurrentPageNumber - 1)
    fetchReferrals()
}

function next() {
    referralStore.setCurrentPageNumber(referralStore.getCurrentPageNumber + 1)
    fetchReferrals()
}

function sort(sortingData: any) {
    referralStore.setCurrentPageNumber(1)
    referralStore.setSortData(sortingData.column, sortingData.sort)
    fetchReferrals()
}

function handleSearch(value: any) {
    referralStore.setCurrentPageNumber(1)
    state.dataFilter.search = value?.[0] == '' ? '' : value?.[0] ?? ''
    fetchReferrals()
}

function handleStatusFilter(value: string | null) {
    state.dataFilter.status = value
    referralStore.setCurrentPageNumber(1)
    fetchReferrals()
}

function changePageLength(event: any) {
    referralStore.setCurrentPageNumber(1)
    referralStore.setCurrentPageLength(event.target.value)
    fetchReferrals()
}

function openNewModal() {
    state.modal.isAddReferralOpen = true
}

function viewReferral(referral: any) {
    state.selectedReferralUuid = referral.uuid
    state.modal.isViewReferralOpen = true
}

function editReferral(referral: any) {
    state.selectedReferralUuid = referral.uuid
    state.modal.isEditReferralOpen = true
}

function deleteConfirmation(referral: any) {
    state.selectedReferralUuid = referral.uuid
    state.modal.isDeleteReferralOpen = true
}

async function deleteReferral() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await referralService.deleteReferral(state.selectedReferralUuid)
        if (response) {
            fetchReferrals()
            successAlert(`${t('alert.success')}!`, `${t('referrals.alert.referralSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
