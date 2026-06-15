<template>
    <Tabs id="journal-tabs" :tabs="state.tabs" :isJustifyBetween="state.tabs?.length > 4 ? true : false"
        @changeTab="changeTab" />
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"

const route = useRoute()
const citizenUuid = route?.params?.uuid
const userStore = useUserStore()
const { t } = useI18n()
const { errorAlert } = useAlert()

const state = reactive({
    tabs: [] as any,
})

watch(() => userStore.getUser, (newValue: any) => {
    if (!newValue) return

    const pages = newValue.pages || []

    const accessMap = {
        Journals: pages.some((page: any) => page.name === 'Journals'),
        MedicineCard: pages.some((page: any) => page.name === 'Medicine card'),
        PlansAndGoals: pages.some((page: any) => page.name === 'Plans and goals'),
        Health: pages.some((page: any) => page.name === 'Health'),
        Documents: pages.some((page: any) => page.name === 'Documents'),
        Attendance: pages.some((page: any) => page.name === 'Attendance'),
        Calendar: pages.some((page: any) => page.name === 'Calendar'),
        Economy: pages.some((page: any) => page.name === 'Economy'),
        Contacts: pages.some((page: any) => page.name === 'Contacts'),
        EmployeeGroups: pages.some((page: any) => page.name === 'Employee Group'),
    }

    state.tabs = []

    if (accessMap.Journals) {
        state.tabs.push({
            name: 'citizens.tabs.journals',
            icon: 'ph:notebook',
            isTranslateName: true,
            href: `/citizens/${citizenUuid}/journals`,
            routeNames: ['citizens-uuid-journals']
        })
    }

    state.tabs.push({
        name: 'citizens.tabs.timeline',
        isTranslateName: true,
        href: `/citizens/${citizenUuid}/timeline`,
        routeNames: ['citizens-uuid-timeline']
    })

    if (accessMap.MedicineCard) {
        state.tabs.push({
            name: 'citizens.tabs.medicineCard',
            icon: 'ph:pill',
            isTranslateName: true,
            href: `/citizens/${citizenUuid}/medicine-journals`,
            routeNames: ['citizens-uuid-medicine-journals']
        })
    }

    if (accessMap.PlansAndGoals) {
        state.tabs.push({
            name: 'citizens.tabs.plansAndGoals',
            icon: 'ph:target',
            isTranslateName: true,
            href: `/citizens/${citizenUuid}/plans-and-goals/all`,
            routeNames: [
                'citizens-uuid-plans-and-goals-all',
                'citizens-uuid-plans-and-goals-active',
                'citizens-uuid-plans-and-goals-archived',
            ]
        })
    }

    if (accessMap.Health) {
        state.tabs.push({
            name: 'citizens.tabs.health',
            icon: 'ph:heartbeat',
            isTranslateName: true,
            href: `/citizens/${citizenUuid}/nursing-areas?open=nursing-professional-records`,
            routeNames: [
                'citizens-uuid-nursing-areas',
                'citizens-uuid-nursing-areas-new',
                'citizens-uuid-nursing-areas-record_uuid-edit'
            ]
        })
    }

    if (accessMap.Documents) {
        state.tabs.push({
            name: 'citizens.tabs.documents',
            icon: 'ph:files',
            isTranslateName: true,
            href: `/citizens/${citizenUuid}/documents`,
            routeNames: ['citizens-uuid-documents']
        })
    }

    if (accessMap.Attendance) {
        state.tabs.push({
            name: 'citizens.tabs.attendance',
            icon: 'ph:clock',
            isTranslateName: true,
            href: `/citizens/${citizenUuid}/attendance`,
            routeNames: [
                'citizens-uuid-attendance',
                'citizens-uuid-attendance-citizen_protocol_uuid'
            ]
        })
    }

    if (accessMap.Calendar) {
        state.tabs.push({
            name: 'citizens.tabs.calendar',
            icon: 'ph:calendar-blank',
            isTranslateName: true,
            href: `/citizens/${citizenUuid}/calendar`,
            routeNames: ['citizens-uuid-calendar']
        })
    }

    if (accessMap.Economy) {
        state.tabs.push({
            name: 'citizens.tabs.economy',
            icon: 'ph:wallet',
            isTranslateName: true,
            href: `/citizens/${citizenUuid}/wallets`,
            routeNames: [
                'citizens-uuid-wallets',
                'citizens-uuid-wallets-wallet_uuid',
                'citizens-uuid-expenses'
            ]
        })
    }

    if (accessMap.Contacts) {
        state.tabs.push({
            name: 'citizens.tabs.contacts',
            icon: 'ph:address-book',
            isTranslateName: true,
            href: `/citizens/${citizenUuid}/contacts`,
            routeNames: ['citizens-uuid-contacts']
        })
    }

    if (accessMap.EmployeeGroups) {
        state.tabs.push({
            name: 'citizens.tabs.employeeGroups',
            icon: 'ph:users-three',
            isTranslateName: true,
            href: `/citizens/${citizenUuid}/employee-groups`,
            routeNames: ['citizens-uuid-employee-groups']
        })
    }

    if (newValue?.company?.industry?.system_name === 'social_welfare' && ['Crisis center', 'Shelter'].includes(newValue?.company?.facility_type?.en_name)) {
        state.tabs.push({
            name: 'citizens.tabs.children',
            icon: 'ph:baby',
            isTranslateName: true,
            href: `/citizens/${citizenUuid}/children`,
            routeNames: ['citizens-uuid-children']
        })
    }

    if (newValue?.company?.industry?.system_name === 'employment_services') {
        state.tabs.push({
            name: 'citizens.tabs.employmentCases',
            isTranslateName: true,
            href: `/citizens/${citizenUuid}/employment-cases`,
            routeNames: ['citizens-uuid-employment-cases']
        })
    }

    // Check if current route is allowed
    const currentRouteName = route.name as string
    const isCurrentRouteAccessible = state.tabs.some((tab: any) =>
        tab.routeNames.some((name: string) => currentRouteName.startsWith(name))
    )


    if (!isCurrentRouteAccessible) {
        const firstAccessibleTab = state.tabs[0]

        if (firstAccessibleTab) {
            navigateTo(firstAccessibleTab.href)
        } else {
            navigateTo('/citizens')
            errorAlert(`${t('alert.somethingWentWrong')}!`, `${t('youDontHaveAccessToThisPage')}.`)
        }
    }
})

function changeTab(value: any) {
    if (value === `/citizens/${citizenUuid}/journals`) {
        navigateTo(`/citizens/${citizenUuid}/journals`)
    }
    else if (value === `/citizens/${citizenUuid}/timeline`) {
        navigateTo(`/citizens/${citizenUuid}/timeline`)
    }
    else if (value === `/citizens/${citizenUuid}/medicine-journals`) {
        navigateTo(`/citizens/${citizenUuid}/medicine-journals`)
    }
    else if (value === `/citizens/${citizenUuid}/plans-and-goals/all`) {
        navigateTo(`/citizens/${citizenUuid}/plans-and-goals/all`)
    }
    else if (value === `/citizens/${citizenUuid}/nursing-areas`) {
        navigateTo(`/citizens/${citizenUuid}/nursing-areas`)
    }
    else if (value === `/citizens/${citizenUuid}/documents`) {
        navigateTo(`/citizens/${citizenUuid}/documents`)
    }
    else if (value === `/citizens/${citizenUuid}/attendance`) {
        navigateTo(`/citizens/${citizenUuid}/attendance`)
    }
    else if (value === `/citizens/${citizenUuid}/calendar`) {
        navigateTo(`/citizens/${citizenUuid}/calendar`)
    }
    else if (value === `/citizens/${citizenUuid}/wallets`) {
        navigateTo(`/citizens/${citizenUuid}/wallets`)
    }
    else if (value === `/citizens/${citizenUuid}/contacts`) {
        navigateTo(`/citizens/${citizenUuid}/contacts`)
    }
    else if (value === `/citizens/${citizenUuid}/employee-groups`) {
        navigateTo(`/citizens/${citizenUuid}/employee-groups`)
    }
    else if (value === `/citizens/${citizenUuid}/children`) {
        navigateTo(`/citizens/${citizenUuid}/children`)
    }
}
</script>