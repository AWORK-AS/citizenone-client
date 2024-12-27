<template>
    <Tabs :tabs="tabs" @changeTab="changeTab" />
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n"

const language = useI18n()
const selectedLanguage = language?.locale

const router = useRouter()
const uuid = router?.currentRoute?.value?.params?.uuid

const tabs = [
    {
        name: 'citizens.tabs.journals',
        href: `/citizens/${uuid}/journals`,
        routeNames: [
            'citizens-uuid-journals',
        ]
    },
    {
        name: 'citizens.tabs.medicineCard',
        href: `/citizens/${uuid}/medicine-journals`,
        routeNames: [
            'citizens-uuid-medicine-journals',
        ]
    },
    {
        name: 'citizens.tabs.plansAndGoals',
        href: `/citizens/${uuid}/plans-and-goals`,
        routeNames: [
            'citizens-uuid-plans-and-goals',
        ]
    },
    {
        name: 'citizens.tabs.health',
        href: `/citizens/${uuid}/nursing-areas`,
        routeNames: [
            'citizens-uuid-nursing-areas',
            'citizens-uuid-nursing-areas-new', ,
            'citizens-uuid-nursing-areas-record_uuid-edit',
        ]
    },
    {
        name: 'citizens.tabs.documents',
        href: `/citizens/${uuid}/documents`,
        routeNames: [
            'citizens-uuid-documents',
        ]
    },
    {
        name: 'citizens.tabs.attendance',
        href: `/citizens/${uuid}/attendance`,
        routeNames: [
            'citizens-uuid-attendance',
            'citizens-uuid-attendance-citizen_protocol_uuid',
        ]
    },
    {
        name: 'citizens.tabs.calendar',
        href: `/citizens/${uuid}/calendar`,
        routeNames: [
            'citizens-uuid-calendar',
        ]
    },
    {
        name: 'citizens.tabs.economy',
        href: `/citizens/${uuid}/wallets`,
        routeNames: [
            'citizens-uuid-wallets',
            'citizens-uuid-wallets-wallet_uuid',
        ]
    },
    {
        name: 'citizens.tabs.contacts',
        href: `/citizens/${uuid}/contacts`,
        routeNames: [
            'citizens-uuid-contacts',
        ]
    },
]

function changeTab(value: any) {
    if (value === 'Journals' || value === 'Journaler') {
        navigateTo(`/citizens/${uuid}/journals`)
    }
    else if (value === 'Medicine card' || value === 'Medicinkort') {
        navigateTo(`/citizens/${uuid}/medicine-journals`)
    }
    else if (value === 'Plans and goals' || value === 'Planer og mål') {
        navigateTo(`/citizens/${uuid}/plans-and-goals`)
    }
    else if (value === 'Nursing areas' || value === 'Sygeplejeområder') {
        navigateTo(`/citizens/${uuid}/nursing-areas`)
    }
    else if (value === 'Documents' || value === 'Dokumenter') {
        navigateTo(`/citizens/${uuid}/documents`)
    }
    else if (value === 'Attendance' || value === 'Fremmøde') {
        navigateTo(`/citizens/${uuid}/attendance`)
    }
    else if (value === 'Calendar' || value === 'Kalender') {
        navigateTo(`/citizens/${uuid}/calendar`)
    }
    else if (value === 'Economy' || value === 'Økonomi') {
        navigateTo(`/citizens/${uuid}/wallets`)
    }
    else if (value === 'Contacts' || value === 'Kontakter') {
        navigateTo(`/citizens/${uuid}/contacts`)
    }
}
</script>