<template>
    <Tabs :tabs="state.tabs" :isJustifyBetween="state.tabs?.length > 4 ? true : false" @changeTab="changeTab" />
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"

const route = useRoute()
const citizenUuid = route?.params?.uuid
const childUuid = route?.params?.child_uuid
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
            href: `/citizens/${citizenUuid}/children/${childUuid}/journals`,
            routeNames: ['citizens-uuid-children-child_uuid-journals']
        })
    }

    if (accessMap.MedicineCard) {
        state.tabs.push({
            name: 'citizens.tabs.medicineCard',
            isTranslateName: true,
            href: `/citizens/${citizenUuid}/children/${childUuid}/medicine-journals`,
            routeNames: ['citizens-uuid-children-child_uuid-medicine-journals']
        })
    }

    if (accessMap.PlansAndGoals) {
        state.tabs.push({
            name: 'citizens.tabs.plansAndGoals',
            isTranslateName: true,
            href: `/citizens/${citizenUuid}/children/${childUuid}/plans-and-goals/all`,
            routeNames: [
                'citizens-uuid-children-child_uuid-plans-and-goals-all',
                'citizens-uuid-children-child_uuid-plans-and-goals-active',
                'citizens-uuid-children-child_uuid-plans-and-goals-archived',
            ]
        })
    }

    if (accessMap.Health) {
        state.tabs.push({
            name: 'citizens.tabs.health',
            isTranslateName: true,
            href: `/citizens/${citizenUuid}/children/${childUuid}/nursing-areas?open=nursing-professional-records`,
            routeNames: [
                'citizens-uuid-children-child_uuid-nursing-areas',
                'citizens-uuid-children-child_uuid-nursing-areas-new',
                'citizens-uuid-children-child_uuid-nursing-areas-record_uuid-edit'
            ]
        })
    }

    if (accessMap.Documents) {
        state.tabs.push({
            name: 'citizens.tabs.documents',
            isTranslateName: true,
            href: `/citizens/${citizenUuid}/children/${childUuid}/documents`,
            routeNames: ['citizens-uuid-children-child_uuid-documents']
        })
    }

    if (accessMap.Attendance) {
        state.tabs.push({
            name: 'citizens.tabs.attendance',
            isTranslateName: true,
            href: `/citizens/${citizenUuid}/children/${childUuid}/attendance`,
            routeNames: [
                'citizens-uuid-children-child_uuid-attendance',
                'citizens-uuid-children-child_uuid-attendance-citizen_protocol_uuid'
            ]
        })
    }

    if (accessMap.Calendar) {
        state.tabs.push({
            name: 'citizens.tabs.calendar',
            isTranslateName: true,
            href: `/citizens/${citizenUuid}/children/${childUuid}/calendar`,
            routeNames: ['citizens-uuid-children-child_uuid-calendar']
        })
    }

    if (accessMap.Economy) {
        state.tabs.push({
            name: 'citizens.tabs.economy',
            isTranslateName: true,
            href: `/citizens/${citizenUuid}/children/${childUuid}/wallets`,
            routeNames: [
                'citizens-uuid-children-child_uuid-wallets',
                'citizens-uuid-children-child_uuid-wallets-wallet_uuid'
            ]
        })
    }

    if (accessMap.Contacts) {
        state.tabs.push({
            name: 'citizens.tabs.contacts',
            isTranslateName: true,
            href: `/citizens/${citizenUuid}/children/${childUuid}/contacts`,
            routeNames: ['citizens-uuid-children-child_uuid-contacts']
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
    if (value === `/citizens/${citizenUuid}/children/${childUuid}/journals`) {
        navigateTo(`/citizens/${citizenUuid}/children/${childUuid}/journals`)
    }
    else if (value === `/citizens/${citizenUuid}/children/${childUuid}/medicine-journals`) {
        navigateTo(`/citizens/${citizenUuid}/children/${childUuid}/medicine-journals`)
    }
    else if (value === `/citizens/${citizenUuid}/children/${childUuid}/plans-and-goals/all`) {
        navigateTo(`/citizens/${citizenUuid}/children/${childUuid}/plans-and-goals/all`)
    }
    else if (value === `/citizens/${citizenUuid}/children/${childUuid}/nursing-areas?open=nursing-professional-records`) {
        navigateTo(`/citizens/${citizenUuid}/children/${childUuid}/nursing-areas`)
    }
    else if (value === `/citizens/${citizenUuid}/children/${childUuid}/documents`) {
        navigateTo(`/citizens/${citizenUuid}/children/${childUuid}/documents`)
    }
    else if (value === `/citizens/${citizenUuid}/children/${childUuid}/attendance`) {
        navigateTo(`/citizens/${citizenUuid}/children/${childUuid}/attendance`)
    }
    else if (value === `/citizens/${citizenUuid}/children/${childUuid}/calendar`) {
        navigateTo(`/citizens/${citizenUuid}/children/${childUuid}/calendar`)
    }
    else if (value === `/citizens/${citizenUuid}/children/${childUuid}/wallets`) {
        navigateTo(`/citizens/${citizenUuid}/children/${childUuid}/wallets`)
    }
    else if (value === `/citizens/${citizenUuid}/children/${childUuid}/contacts`) {
        navigateTo(`/citizens/${citizenUuid}/children/${childUuid}/contacts`)
    }
}
</script>