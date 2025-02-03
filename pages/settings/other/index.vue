<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('archived.tabs.archivedCitizens') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('Other') }}</template>

            <ModulesSettingsTab />

            <ModulesOtherTab/>

            <div class="mt-10">

            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">

</script>