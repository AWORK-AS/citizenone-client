<template>
    <Tabs :tabs="state.tabs" @changeTab="changeTab" />
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n"

const { t } = useI18n()
const router = useRouter()
const companyUuid = router?.currentRoute?.value?.params?.company_uuid

const state = reactive({
    tabs: [
        { name: 'superadmin.companies.tabs.accounts', href: `/superadmin/companies/${companyUuid}/accounts`, routeName: 'superadmin-companies-company_uuid-accounts' },
        { name: 'superadmin.companies.tabs.licenseOverview', href: `/superadmin/companies/${companyUuid}/license-overview`, routeName: 'superadmin-companies-company_uuid-license-overview' },
    ]
})

function changeTab(value: any) {
    if (value === t('superadmin.companies.tabs.accounts')) {
        navigateTo(`/superadmin/companies/${companyUuid}/accounts`)
    }
    else if (value === t('superadmin.companies.tabs.licenseOverview')) {
        navigateTo(`/superadmin/companies/${companyUuid}/license-overview`)
    }
}
</script>