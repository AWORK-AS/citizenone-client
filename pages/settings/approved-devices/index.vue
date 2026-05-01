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

            <ModulesUserSettingsTab />

            <div class="mt-8">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" @click="state.modal.isAddOpen = true">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('approvedDevices.addDevice') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.approvedDevices"
                            :isLoading="state.isTableLoading">
                            <template #body
                                v-if="!(state.isTableLoading || (state.approvedDevices?.data?.length === 0))">
                                <tr v-for="(item, index) in state.approvedDevices?.data" :key="index">
                                    <td>{{ item.user?.firstname }} {{ item.user?.lastname }}</td>
                                    <td>{{ item.device_uuid }}</td>
                                    <td>{{ item.label }}</td>
                                    <td>
                                        <div class="flex items-end justify-end gap-2">
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

            <ModulesUserSettingsApprovedDeviceModalAdd
                :isModalOpen="state.modal.isAddOpen"
                @close="state.modal.isAddOpen = false"
                @refresh="fetchAll" />

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
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()
const { successAlert } = useAlert()

const breadcrumbLinks = [
    { name: 'settings.tabs.company', translate: true, href: '/settings/company' },
    { name: 'approvedDevices.title', translate: true, href: '/settings/approved-devices' },
]

const state = reactive({
    columnHeaders: [
        { name: 'approvedDevices.table.user', value: 'user', isTranslateName: true },
        { name: 'approvedDevices.table.deviceUuid', value: 'device_uuid', isTranslateName: true },
        { name: 'approvedDevices.table.label', value: 'label', isTranslateName: true },
        { name: 'approvedDevices.table.actions.header', value: 'actions', isTranslateName: true },
    ],
    error: {} as Error,
    approvedDevices: {} as any,
    isTableLoading: false,
    modal: {
        isAddOpen: false,
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
        const params = { page: state.pagination.current_page }
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
