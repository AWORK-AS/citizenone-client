<template>
    <Tabs :tabs="state.tabs" :isJustifyBetween="true" @changeTab="changeTab" />
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"

const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const userStore = useUserStore()
const { t } = useI18n()
const { errorAlert } = useAlert()

const state = reactive({
    tabs: [] as any,
})

watch(() => userStore.getUser, (newValue: any) => {
    if (newValue != null) {
        const userHasPageJournalsAccess = newValue?.pages.some((page: any) => page.name === "Journals")
        const userHasPageMedicineCardAccess = newValue?.pages.some((page: any) => page.name === "Medicine card")
        const userHasPagePlansAndGoalsAccess = newValue?.pages.some((page: any) => page.name === "Plans and goals")
        const userHasPageHealthAccess = newValue?.pages.some((page: any) => page.name === "Health")
        const userHasPageDocumentsAccess = newValue?.pages.some((page: any) => page.name === "Documents")
        const userHasPageAttendanceAccess = newValue?.pages.some((page: any) => page.name === "Attendance")
        const userHasPageCalendarAccess = newValue?.pages.some((page: any) => page.name === "Calendar")
        const userHasPageEconomyAccess = newValue?.pages.some((page: any) => page.name === "Economy")
        const userHasPageContactsAccess = newValue?.pages.some((page: any) => page.name === "Contacts")

        if (userHasPageJournalsAccess) {
            state.tabs.push({
                name: 'citizens.tabs.journals',
                href: `/relative/citizens/${citizenUuid}/journals`,
                routeNames: [
                    'citizens-uuid-journals',
                ]
            })
        }
        if (userHasPageMedicineCardAccess) {
            state.tabs.push({
                name: 'citizens.tabs.medicineCard',
                href: `/relative/citizens/${citizenUuid}/medicine-journals`,
                routeNames: [
                    'citizens-uuid-medicine-journals',
                ]
            })
        }
        if (userHasPagePlansAndGoalsAccess) {
            state.tabs.push({
                name: 'citizens.tabs.plansAndGoals',
                href: `/relative/citizens/${citizenUuid}/plans-and-goals`,
                routeNames: [
                    'citizens-uuid-plans-and-goals',
                ]
            })
        }
        if (userHasPageHealthAccess) {
            state.tabs.push({
                name: 'citizens.tabs.health',
                href: `/relative/citizens/${citizenUuid}/nursing-areas`,
                routeNames: [
                    'citizens-uuid-nursing-areas',
                    'citizens-uuid-nursing-areas-new', ,
                    'citizens-uuid-nursing-areas-record_uuid-edit',
                ]
            })
        }
        if (userHasPageDocumentsAccess) {
            state.tabs.push({
                name: 'citizens.tabs.documents',
                href: `/relative/citizens/${citizenUuid}/documents`,
                routeNames: [
                    'citizens-uuid-documents',
                ]
            })
        }
        if (userHasPageAttendanceAccess) {
            state.tabs.push({
                name: 'citizens.tabs.attendance',
                href: `/relative/citizens/${citizenUuid}/attendance`,
                routeNames: [
                    'citizens-uuid-attendance',
                    'citizens-uuid-attendance-citizen_protocol_uuid',
                ]
            })
        }
        if (userHasPageCalendarAccess) {
            state.tabs.push({
                name: 'citizens.tabs.calendar',
                href: `/relative/citizens/${citizenUuid}/calendar`,
                routeNames: [
                    'citizens-uuid-calendar',
                ]
            })
        }
        if (userHasPageEconomyAccess) {
            state.tabs.push({
                name: 'citizens.tabs.economy',
                href: `/relative/citizens/${citizenUuid}/wallets`,
                routeNames: [
                    'citizens-uuid-wallets',
                    'citizens-uuid-wallets-wallet_uuid',
                ]
            })
        }
        if (userHasPageContactsAccess) {
            state.tabs.push({
                name: 'citizens.tabs.contacts',
                href: `/relative/citizens/${citizenUuid}/contacts`,
                routeNames: [
                    'citizens-uuid-contacts',
                ]
            })
        }

        const route = router?.currentRoute?.value?.name as string
        if (!userHasPageContactsAccess && route === 'citizens-uuid-contacts') {
            navigateTo(`/relative/citizens/${citizenUuid}/journals`)
            errorAlert(`${t('alert.somethingWentWrong')}!`, `${t('youDontHaveAccessToThisPage')}.`)
        } else if (!userHasPageEconomyAccess && route === 'citizens-uuid-wallets') {
            navigateTo(`/relative/citizens/${citizenUuid}/journals`)
            errorAlert(`${t('alert.somethingWentWrong')}!`, `${t('youDontHaveAccessToThisPage')}.`)
        } else if (!userHasPageCalendarAccess && route === 'citizens-uuid-calendar') {
            navigateTo(`/relative/citizens/${citizenUuid}/journals`)
            errorAlert(`${t('alert.somethingWentWrong')}!`, `${t('youDontHaveAccessToThisPage')}.`)
        } else if (!userHasPageAttendanceAccess && route === 'citizens-uuid-attendance') {
            navigateTo(`/relative/citizens/${citizenUuid}/journals`)
            errorAlert(`${t('alert.somethingWentWrong')}!`, `${t('youDontHaveAccessToThisPage')}.`)
        } else if (!userHasPageDocumentsAccess && route === 'citizens-uuid-documents') {
            navigateTo(`/relative/citizens/${citizenUuid}/journals`)
            errorAlert(`${t('alert.somethingWentWrong')}!`, `${t('youDontHaveAccessToThisPage')}.`)
        } else if (!userHasPageHealthAccess && route === 'citizens-uuid-nursing-areas') {
            navigateTo(`/relative/citizens/${citizenUuid}/journals`)
            errorAlert(`${t('alert.somethingWentWrong')}!`, `${t('youDontHaveAccessToThisPage')}.`)
        } else if (!userHasPageHealthAccess && route === 'citizens-uuid-nursing-areas') {
            navigateTo(`/relative/citizens/${citizenUuid}/journals`)
            errorAlert(`${t('alert.somethingWentWrong')}!`, `${t('youDontHaveAccessToThisPage')}.`)
        } else if (!userHasPagePlansAndGoalsAccess && route === 'citizens-uuid-plans-and-goals') {
            navigateTo(`/relative/citizens/${citizenUuid}/journals`)
            errorAlert(`${t('alert.somethingWentWrong')}!`, `${t('youDontHaveAccessToThisPage')}.`)
        } else if (!userHasPageMedicineCardAccess && route === 'citizens-uuid-medicine-journals') {
            navigateTo(`/relative/citizens/${citizenUuid}/journals`)
            errorAlert(`${t('alert.somethingWentWrong')}!`, `${t('youDontHaveAccessToThisPage')}.`)
        } else if (!userHasPageJournalsAccess && route === 'citizens-uuid-journals') {
            navigateTo(`/relative/citizens`)
            errorAlert(`${t('alert.somethingWentWrong')}!`, `${t('youDontHaveAccessToThisPage')}.`)
        }
    }
})

function changeTab(value: any) {
    if (value === 'Journals' || value === 'Journaler') {
        navigateTo(`/relative/citizens/${citizenUuid}/journals`)
    }
    else if (value === 'Medicine card' || value === 'Medicinkort') {
        navigateTo(`/relative/citizens/${citizenUuid}/medicine-journals`)
    }
    else if (value === 'Plans and goals' || value === 'Planer og mål') {
        navigateTo(`/relative/citizens/${citizenUuid}/plans-and-goals`)
    }
    else if (value === 'Nursing areas' || value === 'Sygeplejeområder') {
        navigateTo(`/relative/citizens/${citizenUuid}/nursing-areas`)
    }
    else if (value === 'Documents' || value === 'Dokumenter') {
        navigateTo(`/relative/citizens/${citizenUuid}/documents`)
    }
    else if (value === 'Attendance' || value === 'Fremmøde') {
        navigateTo(`/relative/citizens/${citizenUuid}/attendance`)
    }
    else if (value === 'Calendar' || value === 'Kalender') {
        navigateTo(`/relative/citizens/${citizenUuid}/calendar`)
    }
    else if (value === 'Economy' || value === 'Økonomi') {
        navigateTo(`/relative/citizens/${citizenUuid}/wallets`)
    }
    else if (value === 'Contacts' || value === 'Kontakter') {
        navigateTo(`/relative/citizens/${citizenUuid}/contacts`)
    }
}
</script>