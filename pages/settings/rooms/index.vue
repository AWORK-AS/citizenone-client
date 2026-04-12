<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('rooms.rooms') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('rooms.rooms') }}</template>

            <ModulesUserSettingsTab />
            <ModulesUserSettingsCatalogSubTab id="sub-tab-catalog" class="mt-5" />

            <div class="mt-8">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" @click="navigateTo('/settings/rooms/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('rooms.newRoom') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.rooms"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.rooms?.data?.length === 0))">
                                <tr v-for="(room, index) in state.rooms?.data" :key="index">
                                    <td width="50%">
                                        <span>{{ room?.name }}</span>
                                    </td>
                                    <td width="50%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action"
                                                @click="navigateTo(`/settings/rooms/${room.uuid}/edit`)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('rooms.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger"
                                                @click="deleteRoomConfirmation(room)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('rooms.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.rooms" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeleteRoomOpen"
                :message="$t('rooms.table.confirmation.deleteRoomConfirmation') + '?'"
                @close="state.modal.isDeleteRoomOpen = false" @confirm="deleteRoom" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { roomService } from '@/components/api/user/RoomService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'rooms.rooms',
        translate: true,
        href: '/settings/rooms',
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'rooms.table.name', isTranslateName: true, sorter: true, key: 'name' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeleteRoomOpen: false,
    },
    rooms: [] as any,
    selectedRoom: {} as any,
    sortData: {
        sortField: 'name',
        sortOrder: 'ascend',
    },
})

onMounted(() => {
    fetchRooms()
})

async function fetchRooms() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await roomService.getRooms(params)
        if (response) {
            state.rooms = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchRooms()
}

function next() {
    currentTablePage++
    fetchRooms()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchRooms()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchRooms()
}

function deleteRoomConfirmation(room: any) {
    state.selectedRoom = room
    state.modal.isDeleteRoomOpen = true
}

async function deleteRoom() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await roomService.deleteRoom(state.selectedRoom.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchRooms()
            successAlert(`${t('alert.success')}!`, `${t('rooms.table.alert.roomSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>