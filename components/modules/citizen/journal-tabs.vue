<template>
    <Tabs :tabs="tabs" @changeTab="changeTab" />
</template>

<script setup>

const router = useRouter()
const uuid = router?.currentRoute?.value?.params?.uuid

const tabs = [
    { name: 'citizens.tabs.citizenJournals', href: `/citizens/${uuid}/journals`, routeName: 'citizens-uuid-journals' },
    { name: 'citizens.tabs.medicineJournals', href: `/citizens/${uuid}/medicine-journals`, routeName: 'citizens-uuid-medicine-journals' },
    { name: 'citizens.tabs.plansAndGoals', href: `/citizens/${uuid}/plans-and-goals`, routeName: 'citizens-uuid-plans-and-goals' },
    { name: 'citizens.tabs.documents', href: `/citizens/${uuid}/documents`, routeName: 'citizens-uuid-documents' },
    { name: 'citizens.tabs.attendance', href: `/citizens/${uuid}/attendance`, routeName: 'citizens-uuid-attendance' },
]

function changeTab(value) {
    if (value === 'Journals') {
        navigateTo(`/citizens/${uuid}/journals`)
    }
    else if (value === 'Medicine Journals') {
        navigateTo(`/citizens/${uuid}/medicine-journals`)
    }
    else if (value === 'Plans and Goals') {
        navigateTo(`/citizens/${uuid}/plans-and-goals`)
    }
    else if (value === 'Documents') {
        navigateTo(`/citizens/${uuid}/documents`)
    }
    else if (value === 'Attendance') {
        navigateTo(`/citizens/${uuid}/attendance`)
    }
}
</script>