<template>
    <ModulesUserCitizenSectionNav :tabs="state.tabs" />
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
    tabs: [] as any[],
})

const base = `/citizens/${citizenUuid}/children/${childUuid}`
const rn = (suffix: string) => `citizens-uuid-children-child_uuid-${suffix}`

watch(() => userStore.getUser, (newValue: any) => {
    if (!newValue) return

    const pages = newValue.pages || []
    const can = (name: string) => pages.some((page: any) => page.name === name)

    const tabs: any[] = []

    if (can('Journals')) {
        tabs.push({
            name: 'citizens.tabs.journals', icon: 'ph:notebook', isTranslateName: true,
            category: 'documentation', primary: true,
            href: `${base}/journals`, routeNames: [rn('journals')],
        })
    }
    if (can('Medicine card')) {
        tabs.push({
            name: 'citizens.tabs.medicineCard', icon: 'ph:pill', isTranslateName: true,
            category: 'care', primary: true,
            href: `${base}/medicine-journals`, routeNames: [rn('medicine-journals')],
        })
    }
    if (can('Plans and goals')) {
        tabs.push({
            name: 'citizens.tabs.plansAndGoals', icon: 'ph:target', isTranslateName: true,
            category: 'care', primary: true,
            href: `${base}/plans-and-goals/all`,
            routeNames: [
                rn('plans-and-goals-all'),
                rn('plans-and-goals-active'),
                rn('plans-and-goals-archived'),
            ],
        })
    }
    if (can('Health')) {
        tabs.push({
            name: 'citizens.tabs.health', icon: 'ph:heartbeat', isTranslateName: true,
            category: 'care', primary: true,
            href: `${base}/nursing-areas?open=nursing-professional-records`,
            routeNames: [
                rn('nursing-areas'),
                rn('nursing-areas-new'),
                rn('nursing-areas-record_uuid-edit'),
            ],
        })
    }
    if (can('Documents')) {
        tabs.push({
            name: 'citizens.tabs.documents', icon: 'ph:files', isTranslateName: true,
            category: 'documentation', primary: false,
            href: `${base}/documents`, routeNames: [rn('documents')],
        })
    }
    if (can('Attendance')) {
        tabs.push({
            name: 'citizens.tabs.attendance', icon: 'ph:clock', isTranslateName: true,
            category: 'time', primary: false,
            href: `${base}/attendance`,
            routeNames: [rn('attendance'), rn('attendance-citizen_protocol_uuid')],
        })
    }
    if (can('Calendar')) {
        tabs.push({
            name: 'citizens.tabs.calendar', icon: 'ph:calendar-blank', isTranslateName: true,
            category: 'time', primary: false,
            href: `${base}/calendar`, routeNames: [rn('calendar')],
        })
    }
    if (can('Economy')) {
        tabs.push({
            name: 'citizens.tabs.economy', icon: 'ph:wallet', isTranslateName: true,
            category: 'admin', primary: false,
            href: `${base}/wallets`,
            routeNames: [rn('wallets'), rn('wallets-wallet_uuid')],
        })
    }
    if (can('Contacts')) {
        tabs.push({
            name: 'citizens.tabs.contacts', icon: 'ph:address-book', isTranslateName: true,
            category: 'admin', primary: false,
            href: `${base}/contacts`, routeNames: [rn('contacts')],
        })
    }

    state.tabs = tabs

    const currentRouteName = route.name as string
    const isCurrentRouteAccessible = tabs.some((tab) =>
        tab.routeNames.some((name: string) => currentRouteName?.startsWith(name)),
    )
    if (!isCurrentRouteAccessible) {
        if (tabs[0]) {
            navigateTo(tabs[0].href)
        } else {
            navigateTo('/citizens')
            errorAlert(`${t('alert.somethingWentWrong')}!`, `${t('youDontHaveAccessToThisPage')}.`)
        }
    }
})
</script>
