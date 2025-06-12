<template>
    <Tabs :tabs="state.tabs" :isJustifyBetween="state.tabs?.length > 4 ? true : false" @changeTab="changeTab" />
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"

const router = useRouter()
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
    }

    state.tabs = []

    if (accessMap.Journals) {
        state.tabs.push({
            name: 'citizens.tabs.journals',
            isTranslateName: true,
            href: `/citizens/${citizenUuid}/journals`,
            routeNames: ['citizens-uuid-journals']
        })
    }

    if (accessMap.MedicineCard) {
        state.tabs.push({
            name: 'citizens.tabs.medicineCard',
            isTranslateName: true,
            href: `/citizens/${citizenUuid}/medicine-journals`,
            routeNames: ['citizens-uuid-medicine-journals']
        })
    }

    if (accessMap.PlansAndGoals) {
        state.tabs.push({
            name: 'citizens.tabs.plansAndGoals',
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
            isTranslateName: true,
            href: `/citizens/${citizenUuid}/nursing-areas`,
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
            isTranslateName: true,
            href: `/citizens/${citizenUuid}/documents`,
            routeNames: ['citizens-uuid-documents']
        })
    }

    if (accessMap.Attendance) {
        state.tabs.push({
            name: 'citizens.tabs.attendance',
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
            isTranslateName: true,
            href: `/citizens/${citizenUuid}/calendar`,
            routeNames: ['citizens-uuid-calendar']
        })
    }

    if (accessMap.Economy) {
        state.tabs.push({
            name: 'citizens.tabs.economy',
            isTranslateName: true,
            href: `/citizens/${citizenUuid}/wallets`,
            routeNames: [
                'citizens-uuid-wallets',
                'citizens-uuid-wallets-wallet_uuid'
            ]
        })
    }

    if (accessMap.Contacts) {
        state.tabs.push({
            name: 'citizens.tabs.contacts',
            isTranslateName: true,
            href: `/citizens/${citizenUuid}/contacts`,
            routeNames: ['citizens-uuid-contacts']
        })
    }

    // Check if current route is allowed
    const currentRouteName = route.name as string
    const isCurrentRouteAccessible = state.tabs.some(tab =>
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
    if (value === 'Journals' || value === 'Journaler') {
        navigateTo(`/citizens/${citizenUuid}/journals`)
    }
    else if (value === 'Medicine card' || value === 'Medicinkort') {
        navigateTo(`/citizens/${citizenUuid}/medicine-journals`)
    }
    else if (value === 'Plans and goals' || value === 'Planer og mål') {
        navigateTo(`/citizens/${citizenUuid}/plans-and-goals/all`)
    }
    else if (value === 'Nursing areas' || value === 'Sygeplejeområder') {
        navigateTo(`/citizens/${citizenUuid}/nursing-areas`)
    }
    else if (value === 'Documents' || value === 'Dokumenter') {
        navigateTo(`/citizens/${citizenUuid}/documents`)
    }
    else if (value === 'Attendance' || value === 'Fremmøde') {
        navigateTo(`/citizens/${citizenUuid}/attendance`)
    }
    else if (value === 'Calendar' || value === 'Kalender') {
        navigateTo(`/citizens/${citizenUuid}/calendar`)
    }
    else if (value === 'Economy' || value === 'Økonomi') {
        navigateTo(`/citizens/${citizenUuid}/wallets`)
    }
    else if (value === 'Contacts' || value === 'Kontakter') {
        navigateTo(`/citizens/${citizenUuid}/contacts`)
    }
}
</script>