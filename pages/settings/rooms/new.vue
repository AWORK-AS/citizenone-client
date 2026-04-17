<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('rooms.newRoom') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('rooms.newRoom') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/settings/rooms">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserRoomForm formType="create" :selectedRoom="state.formRoom" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="saveRoom" />
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
const breadcrumbLinks = [
    {
        name: 'rooms.rooms',
        translate: true,
        href: '/settings/rooms',
    },
    {
        name: 'rooms.newRoom',
        translate: true,
        href: '/settings/rooms/new',
    },
]

const state = reactive({
    error: {} as Error,
    formRoom: {
        name: '',
    },
    isPageLoading: false,
})

async function saveRoom(roomDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: roomDetails.name,
            capacity: roomDetails.capacity,
        }
        const response = await roomService.saveRoom(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('rooms.form.alert.newRoomSuccessfullySaved')}.`)
            navigateTo('/settings/rooms')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>