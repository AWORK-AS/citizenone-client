<template>
    <ModulesUserCitizenSectionNav :tabs="state.tabs" />
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
    tabs: [] as any[],
})

watch(() => userStore.getUser, (newValue: any) => {
    if (!newValue) return

    const pages = newValue.pages || []
    const can = (name: string) => pages.some((page: any) => page.name === name)
    const systemName = newValue?.company?.industry?.system_name
    const isEmploymentServices = systemName === 'employment_services'

    const tabs: any[] = []

    if (can('Journals')) {
        tabs.push({
            name: 'citizens.tabs.journals', icon: 'ph:notebook', isTranslateName: true,
            category: 'documentation', primary: true,
            href: `/citizens/${citizenUuid}/journals`,
            routeNames: ['citizens-uuid-journals'],
        })
    }
    tabs.push({
        name: 'citizens.tabs.timeline', icon: 'ph:clock-counter-clockwise', isTranslateName: true,
        category: 'documentation', primary: false,
        href: `/citizens/${citizenUuid}/timeline`,
        routeNames: ['citizens-uuid-timeline'],
    })
    if (can('Medicine card') && newValue?.company?.onboarding_preferences?.modules?.medicin !== false) {
        tabs.push({
            name: 'citizens.tabs.medicineCard', icon: 'ph:pill', isTranslateName: true,
            category: 'care', primary: true,
            href: `/citizens/${citizenUuid}/medicine-journals`,
            routeNames: ['citizens-uuid-medicine-journals'],
        })
    }
    if (can('Plans and goals') && newValue?.company?.onboarding_preferences?.modules?.dokumentation !== false) {
        tabs.push({
            name: 'citizens.tabs.plansAndGoals', icon: 'ph:target', isTranslateName: true,
            category: 'care', primary: true,
            href: `/citizens/${citizenUuid}/plans-and-goals/all`,
            routeNames: [
                'citizens-uuid-plans-and-goals-all',
                'citizens-uuid-plans-and-goals-active',
                'citizens-uuid-plans-and-goals-archived',
            ],
        })
    }
    if (can('Health')) {
        tabs.push({
            name: 'citizens.tabs.health', icon: 'ph:heartbeat', isTranslateName: true,
            category: 'care', primary: true,
            href: `/citizens/${citizenUuid}/nursing-areas?open=nursing-professional-records`,
            routeNames: [
                'citizens-uuid-nursing-areas',
                'citizens-uuid-nursing-areas-new',
                'citizens-uuid-nursing-areas-record_uuid-edit',
            ],
        })
    }
    if (can('Documents') && newValue?.company?.onboarding_preferences?.modules?.dokumentation !== false) {
        tabs.push({
            name: 'citizens.tabs.documents', icon: 'ph:files', isTranslateName: true,
            category: 'documentation', primary: false,
            href: `/citizens/${citizenUuid}/documents`,
            routeNames: ['citizens-uuid-documents'],
        })
    }
    if (can('Attendance')) {
        tabs.push({
            name: 'citizens.tabs.attendance', icon: 'ph:clock', isTranslateName: true,
            category: 'time', primary: false,
            href: `/citizens/${citizenUuid}/attendance`,
            routeNames: ['citizens-uuid-attendance', 'citizens-uuid-attendance-citizen_protocol_uuid'],
        })
    }
    if (can('Calendar')) {
        tabs.push({
            name: 'citizens.tabs.calendar', icon: 'ph:calendar-blank', isTranslateName: true,
            category: 'time', primary: false,
            href: `/citizens/${citizenUuid}/calendar`,
            routeNames: ['citizens-uuid-calendar'],
        })
    }
    if (can('Economy')) {
        tabs.push({
            name: 'citizens.tabs.economy', icon: 'ph:wallet', isTranslateName: true,
            category: 'admin', primary: false,
            href: `/citizens/${citizenUuid}/wallets`,
            routeNames: ['citizens-uuid-wallets', 'citizens-uuid-wallets-wallet_uuid', 'citizens-uuid-expenses'],
        })
    }
    if (can('Contacts')) {
        tabs.push({
            name: 'citizens.tabs.contacts', icon: 'ph:address-book', isTranslateName: true,
            category: 'admin', primary: false,
            href: `/citizens/${citizenUuid}/contacts`,
            routeNames: ['citizens-uuid-contacts'],
        })
    }
    if (can('Employee Group')) {
        tabs.push({
            name: 'citizens.tabs.employeeGroups', icon: 'ph:users-three', isTranslateName: true,
            category: 'admin', primary: false,
            href: `/citizens/${citizenUuid}/employee-groups`,
            routeNames: ['citizens-uuid-employee-groups'],
        })
    }
    if (can('Reports') && isEmploymentServices) {
        tabs.push({
            name: 'citizens.tabs.reports', icon: 'ph:chart-bar', isTranslateName: true,
            category: 'documentation', primary: false,
            href: `/citizens/${citizenUuid}/reports`,
            routeNames: ['citizens-uuid-reports'],
        })
    }
    if (systemName === 'social_welfare'
        && ['Crisis center', 'Shelter'].includes(newValue?.company?.facility_type?.en_name)) {
        tabs.push({
            name: 'citizens.tabs.children', icon: 'ph:baby', isTranslateName: true,
            category: 'care', primary: false,
            href: `/citizens/${citizenUuid}/children`,
            routeNames: ['citizens-uuid-children'],
        })
    }
    if (isEmploymentServices) {
        tabs.push({
            name: 'citizens.tabs.employmentCases', icon: 'ph:briefcase', isTranslateName: true,
            category: 'admin', primary: false,
            href: `/citizens/${citizenUuid}/employment-cases`,
            routeNames: ['citizens-uuid-employment-cases'],
        })
        tabs.push({
            name: 'citizens.tabs.outcomes', icon: 'ph:flag', isTranslateName: true,
            category: 'admin', primary: false,
            href: `/citizens/${citizenUuid}/outcomes`,
            routeNames: ['citizens-uuid-outcomes'],
        })
    }

    state.tabs = tabs

    // Redirect away from a section the user can't access.
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
