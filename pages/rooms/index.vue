<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ roomsPageName }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ roomsPageName }}</template>

            <div class="space-y-5">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <TableSearch @search="handleSearch" />

                <div v-if="state.isTableLoading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                    <div v-for="i in 8" :key="i"
                        class="h-36 bg-white ring-1 ring-gray-200 rounded-md animate-pulse" />
                </div>

                <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                    <div v-for="(room, index) in state.rooms?.data" :key="index"
                        @click="openRoom(room)">
                        <div class="h-36 bg-white border-l-4 px-4 py-5 relative overflow-clip ring-1 ring-gray-200 rounded-md cursor-pointer hover:bg-gray-100"
                            :class="room?.capacity && state.citizensPerRoom[room.uuid]?.length >= room.capacity ? 'border-red-400' : 'border-primary/70'">
                            <img src="/img/icons/asset-02.svg" alt="Image failed to load"
                                class="z-10 w-24 absolute -bottom-8 -right-8">
                            <div class="space-y-1 relative z-20">
                                <div class="flex items-center justify-between gap-x-2">
                                    <p class="text-sm font-semibold truncate">{{ room?.name }}</p>
                                    <Badge v-if="room?.capacity && state.citizensPerRoom[room.uuid]?.length >= room.capacity"
                                        type="inactive" class="shrink-0">
                                        {{ $t('rooms.full') }}
                                    </Badge>
                                </div>
                                <p class="text-xs text-gray-500" v-if="room?.capacity">
                                    {{ $t('rooms.form.capacity') }}: {{ room.capacity }}
                                </p>
                                <div class="flex -space-x-2 pt-1" v-if="state.citizensPerRoom[room.uuid]?.length">
                                    <img
                                        v-for="(citizen, ci) in state.citizensPerRoom[room.uuid].slice(0, 4)"
                                        :key="ci"
                                        :src="citizen?.image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${citizen?.firstname}+${citizen?.lastname}`"
                                        :alt="`${citizen?.firstname} ${citizen?.lastname}`"
                                        class="w-7 h-7 rounded-full ring-2 ring-white object-cover"
                                    />
                                    <div
                                        v-if="state.citizensPerRoom[room.uuid].length > 4"
                                        class="w-7 h-7 rounded-full ring-2 ring-white bg-gray-200 flex items-center justify-center text-xxs font-medium text-gray-600">
                                        +{{ state.citizensPerRoom[room.uuid].length - 4 }}
                                    </div>
                                </div>
                                <p v-else class="text-xxs text-gray-400 italic pt-1">{{ $t('rooms.noCitizens') }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <Pagination :data="state.rooms" @previous="previous" @next="next" />
            </div>

            <ModulesUserRoomModalCitizens
                :isModalOpen="state.modal.isRoomOpen"
                :selectedRoom="state.selectedRoom"
                @close="closeRoomModal"
                @refreshCitizens="onRefreshCitizens"
            />

        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { roomService } from '@/components/api/user/RoomService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import { useCustomPagesStore } from '@/store/custom-pages'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const customPagesStore = useCustomPagesStore() as any
let currentTablePage = 1

const roomsPageName = computed(() => customPagesStore.getCustomPagesName?.rooms || t('rooms.rooms'))
const breadcrumbLinks = computed(() => [
    {
        name: roomsPageName.value,
        translate: false,
        href: '/rooms',
    },
])

const state = reactive({
    rooms: [] as any,
    citizensPerRoom: {} as Record<string, any[]>,
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isRoomOpen: false,
    },
    selectedRoom: null as any,
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
            ...state.dataFilter,
        }
        const response = await roomService.getRooms(params)
        if (response) {
            state.rooms = response
            fetchAllRoomCitizens(response?.data ?? [])
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

async function fetchAllRoomCitizens(rooms: any[]) {
    await Promise.all(
        rooms.map(async (room: any) => {
            try {
                const details = await roomService.getRoom(room.uuid)
                if (details) {
                    state.citizensPerRoom[room.uuid] = details?.citizens ?? details?.data?.citizens ?? []
                }
            } catch {
                state.citizensPerRoom[room.uuid] = []
            }
        })
    )
}

function openRoom(room: any) {
    state.selectedRoom = room
    state.modal.isRoomOpen = true
}

function closeRoomModal() {
    state.modal.isRoomOpen = false
    state.selectedRoom = null
}

async function onRefreshCitizens(roomUuid: string) {
    try {
        const details = await roomService.getRoom(roomUuid)
        if (details) {
            state.citizensPerRoom[roomUuid] = details?.citizens ?? details?.data?.citizens ?? []
        }
    } catch {
        // silently ignore — card thumbnails will update on next page load
    }
}

function previous() {
    currentTablePage--
    fetchRooms()
}

function next() {
    currentTablePage++
    fetchRooms()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchRooms()
}
</script>
