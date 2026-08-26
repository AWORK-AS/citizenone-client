<template>
    <Tabs :tabs="state.tabs" :isJustifyBetween="false" @changeTab="changeTab" />
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { useCustomPagesStore } from '@/store/custom-pages'
import { useUserStore } from '@/store/user'

const language = useI18n()
const router = useRouter()
const customPagesStore = useCustomPagesStore() as any
const userStore = useUserStore() as any
const employeeUuid = router?.currentRoute?.value?.params?.employee_uuid
const isInquiryPipelineEnabled = computed(() => !!userStore.getUser?.company?.inquiry_pipeline_enabled)

const state = reactive({
    tabs: [
        {
            name: 'employees.tabs.employeeInformations',
            isTranslateName: true,
            href: `/employees/${employeeUuid}/view-details`,
            routeNames: [
                'employees-employee_uuid-view-details',
            ]
        },
        {
            name: customPagesStore.getCustomPagesName?.dutySchedules,
            isTranslateName: false,
            href: `/employees/${employeeUuid}/duty-schedule`,
            routeNames: [
                'employees-employee_uuid-duty-schedule',
            ]
        },
        {
            name: 'employees.tabs.timeLogs',
            isTranslateName: true,
            href: `/employees/${employeeUuid}/time-logs`,
            routeNames: [
                'employees-employee_uuid-time-logs',
            ]
        },
        {
            name: 'employees.tabs.mileageLog',
            isTranslateName: true,
            href: `/employees/${employeeUuid}/mileage-log`,
            routeNames: [
                'employees-employee_uuid-mileage-log',
            ]
        },
        ...(isInquiryPipelineEnabled.value ? [{
            name: 'employees.tabs.consultantProfile',
            isTranslateName: true,
            href: `/employees/${employeeUuid}/consultant-profile`,
            routeNames: [
                'employees-employee_uuid-consultant-profile',
            ]
        }] : []),
    ] as any
})

watch(() => language.locale.value, (language: any) => {
    state.tabs = [
        {
            name: 'employees.tabs.employeeInformations',
            isTranslateName: true,
            href: `/employees/${employeeUuid}/view-details`,
            routeNames: [
                'employees-employee_uuid-view-details',
            ]
        },
        {
            name: customPagesStore.getCustomPagesName?.dutySchedules,
            isTranslateName: false,
            href: `/employees/${employeeUuid}/duty-schedule`,
            routeNames: [
                'employees-employee_uuid-duty-schedule',
            ]
        },
        {
            name: 'employees.tabs.timeLogs',
            isTranslateName: true,
            href: `/employees/${employeeUuid}/time-logs`,
            routeNames: [
                'employees-employee_uuid-time-logs',
            ]
        },
        {
            name: 'employees.tabs.mileageLog',
            isTranslateName: true,
            href: `/employees/${employeeUuid}/mileage-log`,
            routeNames: [
                'employees-employee_uuid-mileage-log',
            ]
        },
        ...(isInquiryPipelineEnabled.value ? [{
            name: 'employees.tabs.consultantProfile',
            isTranslateName: true,
            href: `/employees/${employeeUuid}/consultant-profile`,
            routeNames: [
                'employees-employee_uuid-consultant-profile',
            ]
        }] : []),
    ]
})

function changeTab(value: any) {
    if (value === `/employees/${employeeUuid}/view-details`) {
        navigateTo(`/employees/${employeeUuid}/view-details`)
    }
    else if (value === `/employees/${employeeUuid}/duty-schedule`) {
        navigateTo(`/employees/${employeeUuid}/duty-schedule`)
    }
    else if (value === `/employees/${employeeUuid}/time-logs`) {
        navigateTo(`/employees/${employeeUuid}/time-logs`)
    }
    else if (value === `/employees/${employeeUuid}/mileage-log`) {
        navigateTo(`/employees/${employeeUuid}/mileage-log`)
    }
}
</script>
