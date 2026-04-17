<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('rooms.editRoom') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('rooms.editRoom') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/settings/rooms">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserRoomForm formType="update" :selectedRoom="state.formRoom" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="updateRoom" />
                </LoadingSpinner>
            </div>
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
const router = useRouter()
const roomUuid = router?.currentRoute?.value?.params?.uuid
const breadcrumbLinks = [
    {
        name: 'rooms.rooms',
        translate: true,
        href: '/settings/rooms',
    },
    {
        name: 'rooms.editRoom',
        translate: true,
        href: `/settings/rooms/${roomUuid}/edit`,
    },
]

const state = reactive({
    error: {} as Error,
    formRoom: {
        name: '',
        capacity: null as number | null,
    },
    isPageLoading: false,
})

onMounted(() => {
    fetchRoom()
})

async function fetchRoom() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await roomService.getRoom(roomUuid)
        if (response) {
            state.formRoom = {
                name: response?.data?.name ?? '',
                capacity: response?.data?.capacity ?? null,
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateRoom(roomDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: roomDetails.name,
            capacity: roomDetails.capacity,
        }
        const response = await roomService.updateRoom(roomUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('rooms.form.alert.roomSuccessfullyUpdated')}.`)
            navigateTo('/settings/rooms')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>