<template>
    <Tabs :tabs="state.tabs" @changeTab="changeTab" />
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'

const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const userStore = useUserStore()

const tabs = [
    {
        name: 'citizens.tabs.journals',
        href: `/citizens/${citizenUuid}/journals`,
        routeNames: [
            'citizens-uuid-journals',
        ]
    },
    {
        name: 'citizens.tabs.medicineCard',
        href: `/citizens/${citizenUuid}/medicine-journals`,
        routeNames: [
            'citizens-uuid-medicine-journals',
        ]
    },
    {
        name: 'citizens.tabs.plansAndGoals',
        href: `/citizens/${citizenUuid}/plans-and-goals`,
        routeNames: [
            'citizens-uuid-plans-and-goals',
        ]
    },
    {
        name: 'citizens.tabs.health',
        href: `/citizens/${citizenUuid}/nursing-areas`,
        routeNames: [
            'citizens-uuid-nursing-areas',
            'citizens-uuid-nursing-areas-new', ,
            'citizens-uuid-nursing-areas-record_uuid-edit',
        ]
    },
    {
        name: 'citizens.tabs.documents',
        href: `/citizens/${citizenUuid}/documents`,
        routeNames: [
            'citizens-uuid-documents',
        ]
    },
    {
        name: 'citizens.tabs.attendance',
        href: `/citizens/${citizenUuid}/attendance`,
        routeNames: [
            'citizens-uuid-attendance',
            'citizens-uuid-attendance-citizen_protocol_uuid',
        ]
    },
    {
        name: 'citizens.tabs.calendar',
        href: `/citizens/${citizenUuid}/calendar`,
        routeNames: [
            'citizens-uuid-calendar',
        ]
    },
    {
        name: 'citizens.tabs.economy',
        href: `/citizens/${citizenUuid}/wallets`,
        routeNames: [
            'citizens-uuid-wallets',
            'citizens-uuid-wallets-wallet_uuid',
        ]
    },
    {
        name: 'citizens.tabs.contacts',
        href: `/citizens/${citizenUuid}/contacts`,
        routeNames: [
            'citizens-uuid-contacts',
        ]
    },
]

const state = reactive({
    tabs: [] as any,
})

watch(() => userStore.getUser, (newValue: any) => {
    if (newValue != null) {
        const userHasAdminRole = newValue?.roles.some((role: any) => role.name === "Admin")
        const userHasPageEconomyAccess = newValue?.pages.some((page: any) => page.name === "Economy")
        if (userHasAdminRole || userHasPageEconomyAccess) {
            state.tabs = [
                {
                    name: 'citizens.tabs.journals',
                    href: `/citizens/${citizenUuid}/journals`,
                    routeNames: [
                        'citizens-uuid-journals',
                    ]
                },
                {
                    name: 'citizens.tabs.medicineCard',
                    href: `/citizens/${citizenUuid}/medicine-journals`,
                    routeNames: [
                        'citizens-uuid-medicine-journals',
                    ]
                },
                {
                    name: 'citizens.tabs.plansAndGoals',
                    href: `/citizens/${citizenUuid}/plans-and-goals`,
                    routeNames: [
                        'citizens-uuid-plans-and-goals',
                    ]
                },
                {
                    name: 'citizens.tabs.health',
                    href: `/citizens/${citizenUuid}/nursing-areas`,
                    routeNames: [
                        'citizens-uuid-nursing-areas',
                        'citizens-uuid-nursing-areas-new', ,
                        'citizens-uuid-nursing-areas-record_uuid-edit',
                    ]
                },
                {
                    name: 'citizens.tabs.documents',
                    href: `/citizens/${citizenUuid}/documents`,
                    routeNames: [
                        'citizens-uuid-documents',
                    ]
                },
                {
                    name: 'citizens.tabs.attendance',
                    href: `/citizens/${citizenUuid}/attendance`,
                    routeNames: [
                        'citizens-uuid-attendance',
                        'citizens-uuid-attendance-citizen_protocol_uuid',
                    ]
                },
                {
                    name: 'citizens.tabs.calendar',
                    href: `/citizens/${citizenUuid}/calendar`,
                    routeNames: [
                        'citizens-uuid-calendar',
                    ]
                },
                {
                    name: 'citizens.tabs.economy',
                    href: `/citizens/${citizenUuid}/wallets`,
                    routeNames: [
                        'citizens-uuid-wallets',
                        'citizens-uuid-wallets-wallet_uuid',
                    ]
                },
                {
                    name: 'citizens.tabs.contacts',
                    href: `/citizens/${citizenUuid}/contacts`,
                    routeNames: [
                        'citizens-uuid-contacts',
                    ]
                },
            ]
        } else {
            state.tabs = [
                {
                    name: 'citizens.tabs.journals',
                    href: `/citizens/${citizenUuid}/journals`,
                    routeNames: [
                        'citizens-uuid-journals',
                    ]
                },
                {
                    name: 'citizens.tabs.medicineCard',
                    href: `/citizens/${citizenUuid}/medicine-journals`,
                    routeNames: [
                        'citizens-uuid-medicine-journals',
                    ]
                },
                {
                    name: 'citizens.tabs.plansAndGoals',
                    href: `/citizens/${citizenUuid}/plans-and-goals`,
                    routeNames: [
                        'citizens-uuid-plans-and-goals',
                    ]
                },
                {
                    name: 'citizens.tabs.health',
                    href: `/citizens/${citizenUuid}/nursing-areas`,
                    routeNames: [
                        'citizens-uuid-nursing-areas',
                        'citizens-uuid-nursing-areas-new', ,
                        'citizens-uuid-nursing-areas-record_uuid-edit',
                    ]
                },
                {
                    name: 'citizens.tabs.documents',
                    href: `/citizens/${citizenUuid}/documents`,
                    routeNames: [
                        'citizens-uuid-documents',
                    ]
                },
                {
                    name: 'citizens.tabs.attendance',
                    href: `/citizens/${citizenUuid}/attendance`,
                    routeNames: [
                        'citizens-uuid-attendance',
                        'citizens-uuid-attendance-citizen_protocol_uuid',
                    ]
                },
                {
                    name: 'citizens.tabs.calendar',
                    href: `/citizens/${citizenUuid}/calendar`,
                    routeNames: [
                        'citizens-uuid-calendar',
                    ]
                },
                {
                    name: 'citizens.tabs.contacts',
                    href: `/citizens/${citizenUuid}/contacts`,
                    routeNames: [
                        'citizens-uuid-contacts',
                    ]
                },
            ]

            const route = router?.currentRoute?.value?.name as string
            if (['citizens-uuid-wallets'].includes(route)) {
                navigateTo(`/citizens/${citizenUuid}/journals`)
            }
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
        navigateTo(`/citizens/${citizenUuid}/plans-and-goals`)
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