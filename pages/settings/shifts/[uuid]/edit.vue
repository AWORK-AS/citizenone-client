<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('shifts.editShift') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('shifts.editShift') }}</template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/settings/shifts">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>
            <LoadingSpinner :isActive="state.isPageLoading">
                <ModulesUserDutyScheduleShiftForm formType="update" :selectedShift="state.formShift"
                    :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                    @submitForm="updateShift" />
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { shiftService } from '@/components/api/user/ShiftService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const shiftUuid = router?.currentRoute?.value?.params?.uuid
const breadcrumbLinks = [
    {
        name: 'shifts.shifts',
        translate: true,
        href: '/settings/shifts',
    },
    {
        name: 'shifts.editShift',
        translate: true,
        href: `/settings/shifts/${shiftUuid}/edit`,
    },
]

const state = reactive({
    error: {} as Error,
    formShift: {
        en_name: '',
        dk_name: '',
        color: '',
    },
    isPageLoading: false,
})

onMounted(() => {
    fetchShift()
})

async function fetchShift() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await shiftService.getShift(shiftUuid)
        if (response) {
            state.formShift = {
                en_name: response?.data?.en_name ?? '',
                dk_name: response?.data?.dk_name ?? '',
                color: response?.data?.color ?? '',
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateShift(shiftDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            en_name: shiftDetails.en_name,
            dk_name: shiftDetails.dk_name,
            color: shiftDetails.color,
        }
        const response = await shiftService.updateShift(shiftUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('shifts.form.alert.shiftSuccessfullyUpdated')}.`)
            navigateTo('/settings/shifts')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>