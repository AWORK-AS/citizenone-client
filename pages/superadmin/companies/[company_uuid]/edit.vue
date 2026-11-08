<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.companies.editCompany') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>{{ $t('superadmin.companies.editCompany') }}</template>

            <div class="p-1">
                <ModulesSuperadminCompanyHeader />

                <div class="max-w-2xl">
                    <ModulesSuperadminCompanyEditCompany />
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
</script>
