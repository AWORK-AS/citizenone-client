<template>
    <Tabs :tabs="state.tabs" :isJustifyBetween="false" @changeTab="changeTab" />
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { useCustomPagesStore } from '@/store/custom-pages'
import { useUserStore } from '@/store/user'
import { usePermissions } from '@/composables/usePermissions'
import { consultantSkillService } from '@/components/api/user/ConsultantSkillService'
import { consultantTabRedirect, showsConsultantTab } from '@/composables/consultantTab'

const language = useI18n()
const router = useRouter()
const customPagesStore = useCustomPagesStore() as any
const userStore = useUserStore() as any
const { isAtLeast, seesHrData } = usePermissions()
const employeeUuid = router?.currentRoute?.value?.params?.employee_uuid
const isInquiryPipelineEnabled = computed(() => !!userStore.getUser?.company?.inquiry_pipeline_enabled)
// The consultant tab is for consultants only (a role counting as consultant, or
// employed as one). Until the profile says so, and with a backend that does not
// say it yet, the tab stays as before.
const isConsultant = ref(true)

// Managers see every employee's monthly sheet; anyone else only their own, and only when
// they may see working hours (the same rule the backend enforces).
const canSeeMonthlySheet = computed(() =>
    isAtLeast('Manager') || (userStore.getUser?.uuid === employeeUuid && !!userStore.getUser?.show_working_hours))

// The backend lets those who see HR data (Admins and roles with "can see HR details
// and employee documents") read and write HR details, and an employee read their
// own; it answers 403 to anyone else.
const canSeeHrDetails = computed(() =>
    seesHrData() || userStore.getUser?.uuid === employeeUuid)

function buildTabs() {
    return [
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
        ...(canSeeMonthlySheet.value ? [{
            name: 'employees.tabs.monthlySheet',
            isTranslateName: true,
            href: `/employees/${employeeUuid}/monthly-sheet`,
            routeNames: [
                'employees-employee_uuid-monthly-sheet',
            ]
        }] : []),
        {
            name: 'employees.tabs.mileageLog',
            isTranslateName: true,
            href: `/employees/${employeeUuid}/mileage-log`,
            routeNames: [
                'employees-employee_uuid-mileage-log',
            ]
        },
        ...(canSeeHrDetails.value ? [{
            name: 'employees.tabs.hrDetails',
            isTranslateName: true,
            href: `/employees/${employeeUuid}/hr-details`,
            routeNames: [
                'employees-employee_uuid-hr-details',
            ]
        }] : []),
        ...(isInquiryPipelineEnabled.value && isConsultant.value ? [{
            name: 'employees.tabs.consultantProfile',
            isTranslateName: true,
            href: `/employees/${employeeUuid}/consultant-profile`,
            routeNames: [
                'employees-employee_uuid-consultant-profile',
            ]
        }] : []),
    ] as any
}

const state = reactive({
    tabs: buildTabs()
})

watch(() => language.locale.value, () => {
    state.tabs = buildTabs()
})

// The user is loaded after the page in some flows, so the tab list follows it.
watch(canSeeMonthlySheet, () => {
    state.tabs = buildTabs()
})

onMounted(async () => {
    if (!isInquiryPipelineEnabled.value || !employeeUuid) return
    try {
        const profile: any = await consultantSkillService.getProfile(employeeUuid as string)
        if (!showsConsultantTab(profile)) {
            isConsultant.value = false
            state.tabs = buildTabs()
            // Opened by link or bookmark: the hidden tab sends you to the details.
            const to = consultantTabRedirect(router.currentRoute.value.path, employeeUuid as string, false)
            if (to) navigateTo(to)
        }
    } catch {
        // No profile answer: keep the tab as it was.
    }
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
    else if (value === `/employees/${employeeUuid}/monthly-sheet`) {
        navigateTo(`/employees/${employeeUuid}/monthly-sheet`)
    }
    else if (value === `/employees/${employeeUuid}/mileage-log`) {
        navigateTo(`/employees/${employeeUuid}/mileage-log`)
    }
}
</script>
