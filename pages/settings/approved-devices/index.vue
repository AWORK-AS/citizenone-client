<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('approvedDevices.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('approvedDevices.title') }}</template>

            <div class="mt-8">
                <div class="space-y-5">
                    <p class="text-sm text-gray-600">{{ $t('approvedDevices.help') }}</p>
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.approvedDevices"
                            :isLoading="state.isTableLoading">
                            <template #body
                                v-if="!(state.isTableLoading || (state.approvedDevices?.data?.length === 0))">
                                <tr v-for="(item, index) in state.approvedDevices?.data" :key="index">
                                    <td>{{ item.user?.firstname }} {{ item.user?.lastname }}</td>
                                    <td :title="item.user_agent || ''">{{ deviceLabel(item.user_agent) || '—' }}</td>
                                    <td>{{ item.label }}</td>
                                    <td>
                                        <span :class="STATUS_CLASSES[statusOf(item)]"
                                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                                            {{ $t(`approvedDevices.status.${statusOf(item)}`) }}
                                        </span>
                                    </td>
                                    <td>{{ item.created_at ? formatDateToReadable(item.created_at) : '' }}</td>
                                    <td>
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton v-if="statusOf(item) === 'waiting'" type="button"
                                                buttonStyle="primary" @click="approveItem(item)">
                                                <Icon name="ph:check" class="size-4" />
                                                {{ $t('approvedDevices.table.actions.approve') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action"
                                                @click="editItem(item)">
                                                <Icon name="ph:pencil" class="size-4" />
                                                {{ $t('approvedDevices.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger"
                                                @click="deleteConfirmation(item)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('approvedDevices.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.approvedDevices" @previous="previous" @next="next" />
                </div>
            </div>

            <DialogConfirmation :isModalOpen="state.modal.isDeleteOpen"
                :message="$t('approvedDevices.confirmation.delete') + '?'"
                @close="state.modal.isDeleteOpen = false" @confirm="deleteApprovedDevice" />

            <ModulesUserSettingsApprovedDeviceModalEdit
                v-if="state.selectedItem"
                :isModalOpen="state.modal.isEditOpen"
                :selectedApprovedDevice="state.selectedItem"
                @close="state.modal.isEditOpen = false"
                @refresh="fetchAll" />

        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { approvedDeviceService } from '@/components/api/user/ApprovedDeviceService'
import { useAlert } from '@/composables/alert'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { deviceLabel } from '@/utils/deviceLabel'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

// The login whitelists are for the company's Admins; the API refuses everyone else too.
definePageMeta({ middleware: 'require-admin' })

const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()
const { successAlert } = useAlert()
const { formatDateToReadable } = useDatetimeFormatter()

type DeviceStatus = 'waiting' | 'approved' | 'off'

const STATUS_CLASSES: Record<DeviceStatus, string> = {
    waiting: 'bg-amber-100 text-amber-800',
    approved: 'bg-green-100 text-green-700',
    off: 'bg-red-100 text-red-700',
}

const breadcrumbLinks = [
    { name: 'settings.tabs.company', translate: true, href: '/settings/company' },
    { name: 'approvedDevices.title', translate: true, href: '/settings/approved-devices' },
]

const state = reactive({
    columnHeaders: [
        { name: 'approvedDevices.table.user', value: 'user', isTranslateName: true },
        { name: 'approvedDevices.table.device', value: 'user_agent', isTranslateName: true },
        { name: 'approvedDevices.table.label', value: 'label', isTranslateName: true },
        { name: 'approvedDevices.table.isActive', value: 'status', isTranslateName: true },
        { name: 'approvedDevices.table.firstSeen', value: 'created_at', isTranslateName: true },
        { name: '', value: 'actions' },
    ],
    dataFilter: {
        search: '',
    },
    error: {} as Error,
    approvedDevices: {} as any,
    isTableLoading: false,
    modal: {
        isEditOpen: false,
        isDeleteOpen: false,
    },
    pagination: {
        current_page: 1,
    },
    selectedItem: null as any,
})

onMounted(() => {
    fetchAll()
})

async function fetchAll() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = { page: state.pagination.current_page, ...state.dataFilter }
        const response = await approvedDeviceService.getAll(params)
        if (response.data) {
            state.approvedDevices = Array.isArray(response.data)
                ? { data: response.data }
                : response.data
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function handleSearch(value: any) {
    state.pagination.current_page = 1
    state.dataFilter.search = value?.[0] === '' ? [] : value
    fetchAll()
}

// Older responses had no status: active is approved, anything else is off.
function statusOf(item: any): DeviceStatus {
    if (item?.status === 'waiting' || item?.status === 'approved' || item?.status === 'off') return item.status
    return item?.is_active ? 'approved' : 'off'
}

async function approveItem(item: any) {
    state.error = {}
    state.isTableLoading = true
    try {
        await approvedDeviceService.update(item.uuid, { is_active: true })
        successAlert(`${t('alert.success')}!`, `${t('approvedDevices.alert.approved')}.`)
        await fetchAll()
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function editItem(item: any) {
    state.selectedItem = item
    state.modal.isEditOpen = true
}

function deleteConfirmation(item: any) {
    state.selectedItem = item
    state.modal.isDeleteOpen = true
}

async function deleteApprovedDevice() {
    state.isTableLoading = true
    state.modal.isDeleteOpen = false
    try {
        await approvedDeviceService.delete(state.selectedItem.uuid)
        successAlert(`${t('alert.success')}!`, `${t('approvedDevices.alert.deleted')}.`)
        fetchAll()
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    if (state.pagination.current_page > 1) {
        state.pagination.current_page--
        fetchAll()
    }
}

function next() {
    state.pagination.current_page++
    fetchAll()
}
</script>
