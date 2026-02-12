<template>
    <Tabs :tabs="state.tabs" :isJustifyBetween="false" @changeTab="changeTab" />
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { useCustomPagesStore } from '@/store/custom-pages'

const { t } = useI18n()
const router = useRouter()
const customPagesStore = useCustomPagesStore() as any
const employeeUuid = router?.currentRoute?.value?.params?.employee_uuid

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
    ] as any
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
}
</script>