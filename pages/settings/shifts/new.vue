<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('shifts.addNewShift') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('shifts.addNewShift') }}</template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/settings/shifts">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>
            <LoadingSpinner :isActive="state.isPageLoading">
                <ModulesUserDutyScheduleShiftForm formType="create" :selectedShift="state.formShift"
                    :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                    @submitForm="saveShift" />
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
const breadcrumbLinks = [
    {
        name: 'shifts.shifts',
        translate: true,
        href: '/settings/shifts',
    },
    {
        name: 'shifts.addNewShift',
        translate: true,
        href: '/settings/shifts/new',
    },
]

const state = reactive({
    error: {} as Error,
    formShift: {
        en_name: '',
        dk_name: '',
        pay_code: '',
        time_in: '',
        time_out: '',
        color: '',
        is_leave_shift_type: false,
        working_hours_factor: null as string | null,
        working_hours_factor_from: null as string | null,
        working_hours_factor_to: null as string | null,
        end_time_day_offset: null as number | null,
        system_name: null as string | null,
    },
    isPageLoading: false,
})

async function saveShift(shiftDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            en_name: shiftDetails.en_name,
            dk_name: shiftDetails.dk_name,
            pay_code: shiftDetails.pay_code,
            time_in: shiftDetails.time_in ?? '',
            time_out: shiftDetails.time_out ?? '',
            color: shiftDetails.color,
            is_leave_shift_type: shiftDetails.is_leave_shift_type,
            working_hours_factor: shiftDetails.working_hours_factor || null,
            working_hours_factor_from: shiftDetails.working_hours_factor_from ? shiftDetails.working_hours_factor_from.substring(0, 5) : null,
            working_hours_factor_to: shiftDetails.working_hours_factor_to ? shiftDetails.working_hours_factor_to.substring(0, 5) : null,
        }
        const response = await shiftService.saveShift(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('shifts.form.alert.newShiftSuccessfullySaved')}.`)
            navigateTo('/settings/shifts')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
