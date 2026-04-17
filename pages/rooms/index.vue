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

            <div class="space-y-5">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <TableSearch @search="handleSearch" />

                <div v-if="state.isTableLoading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    <div v-for="i in 6" :key="i"
                        class="h-44 bg-white ring-1 ring-gray-200 rounded-xl animate-pulse" />
                </div>

                <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    <div v-for="(room, index) in state.rooms?.data" :key="index"
                        @click="openRoom(room)"
                        class="relative overflow-hidden bg-white ring-1 ring-gray-200 rounded-xl px-5 py-5 cursor-pointer hover:bg-gray-50 transition-colors">
                        <img src="/img/icons/asset-02.svg" alt=""
                            class="w-28 absolute -bottom-10 -right-10 opacity-10 pointer-events-none" />

                        <div class="relative z-10 flex flex-col gap-y-3">
                            <div class="flex items-start justify-between gap-x-2">
                                <div>
                                    <p class="font-semibold text-gray-900 leading-tight">{{ room?.name }}</p>
                                    <p class="text-xs text-gray-400 mt-0.5" v-if="room?.capacity">
                                        {{ $t('rooms.form.capacity') }}: {{ room.capacity }}
                                    </p>
                                </div>
                                <Icon name="ph:door" class="size-5 text-gray-300 shrink-0 mt-0.5" />
                            </div>

                            <div class="flex items-center gap-x-1.5 mt-1">
                                <div v-if="state.citizensPerRoom[room.uuid]?.length" class="flex -space-x-2">
                                    <img
                                        v-for="(citizen, ci) in state.citizensPerRoom[room.uuid].slice(0, 5)"
                                        :key="ci"
                                        :src="citizen?.image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${citizen?.firstname}+${citizen?.lastname}`"
                                        :alt="`${citizen?.firstname} ${citizen?.lastname}`"
                                        class="w-8 h-8 rounded-full ring-2 ring-white object-cover"
                                    />
                                    <div
                                        v-if="state.citizensPerRoom[room.uuid].length > 5"
                                        class="w-8 h-8 rounded-full ring-2 ring-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                                        +{{ state.citizensPerRoom[room.uuid].length - 5 }}
                                    </div>
                                </div>
                                <p v-else class="text-xs text-gray-400 italic">{{ $t('rooms.noCitizens') }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <Pagination :data="state.rooms" @previous="previous" @next="next" />
            </div>

            <Modal :show="state.modal.isRoomOpen" :title="state.selectedRoom?.name" size="sm"
                @close="closeRoomModal">
                <template #modal-body>
                    <div v-if="state.isModalLoading" class="space-y-3 py-2">
                        <div v-for="i in 4" :key="i" class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-gray-200 animate-pulse shrink-0" />
                            <div class="h-4 bg-gray-200 rounded animate-pulse w-40" />
                        </div>
                    </div>

                    <div v-else-if="state.citizensPerRoom[state.selectedRoom?.uuid]?.length" class="space-y-2 pb-4">
                        <div
                            v-for="(citizen, ci) in state.citizensPerRoom[state.selectedRoom?.uuid]"
                            :key="ci"
                            class="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50">
                            <img
                                :src="citizen?.image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${citizen?.firstname}+${citizen?.lastname}`"
                                :alt="`${citizen?.firstname} ${citizen?.lastname}`"
                                class="w-10 h-10 rounded-full object-cover shrink-0"
                            />
                            <span class="text-sm font-medium text-gray-800">
                                {{ citizen?.firstname }} {{ citizen?.lastname }}
                            </span>
                        </div>
                    </div>

                    <div v-else class="py-6 text-center text-sm text-gray-400">
                        {{ $t('rooms.noCitizens') }}
                    </div>
                </template>
            </Modal>

        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { roomService } from '@/components/api/user/RoomService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'rooms.rooms',
        translate: true,
        href: '/rooms',
    },
]

const state = reactive({
    rooms: [] as any,
    citizensPerRoom: {} as Record<string, any[]>,
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    isModalLoading: false,
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

async function openRoom(room: any) {
    state.selectedRoom = room
    state.modal.isRoomOpen = true
    if (!state.citizensPerRoom[room.uuid]) {
        state.isModalLoading = true
        try {
            const details = await roomService.getRoom(room.uuid)
            if (details) {
                state.citizensPerRoom[room.uuid] = details?.citizens ?? details?.data?.citizens ?? []
            }
        } catch {
            state.citizensPerRoom[room.uuid] = []
        }
        state.isModalLoading = false
    }
}

function closeRoomModal() {
    state.modal.isRoomOpen = false
    state.selectedRoom = null
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
