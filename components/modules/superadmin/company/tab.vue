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
        { name: 'superadmin.companies.tabs.accounts', isTranslateName: true, href: `/superadmin/companies/${companyUuid}/accounts`, routeNames: ['superadmin-companies-company_uuid-accounts'] },
        { name: 'superadmin.companies.tabs.licenses', isTranslateName: true, href: `/superadmin/companies/${companyUuid}/license-overview`, routeNames: ['superadmin-companies-company_uuid-license-overview'] },
        { name: 'superadmin.companies.tabs.apps', isTranslateName: true, href: `/superadmin/companies/${companyUuid}/apps`, routeNames: ['superadmin-companies-company_uuid-apps'] },
    ]
})

function changeTab(value: any) {
    if (value === t('superadmin.companies.tabs.accounts')) {
        navigateTo(`/superadmin/companies/${companyUuid}/accounts`)
    }
    else if (value === t('superadmin.companies.tabs.licenses')) {
        navigateTo(`/superadmin/companies/${companyUuid}/license-overview`)
    }
    else if (value === t('superadmin.companies.tabs.apps')) {
        navigateTo(`/superadmin/companies/${companyUuid}/apps`)
    }
}
</script>