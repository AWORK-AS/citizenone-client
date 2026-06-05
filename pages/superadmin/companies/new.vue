<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.companies.newCompany') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>{{ $t('superadmin.companies.newCompany') }}</template>

            <div class="p-1 max-w-2xl">
                <NuxtLink to="/superadmin/companies"
                    class="inline-flex items-center gap-1.5 text-sm text-[#5C6478] hover:text-[#1F2533] mb-6 transition-colors">
                    <Icon name="ph:arrow-left" class="w-4 h-4" />
                    {{ $t('superadmin.companies.companies') }}
                </NuxtLink>
                <ModulesSuperadminCompanyNewCompany />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
</script>
