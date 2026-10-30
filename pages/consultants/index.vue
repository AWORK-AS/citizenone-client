<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('consultantMatch.generalTitle') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('consultantMatch.generalTitle') }}</template>

            <!-- The same search as from an inquiry, without one: for finding a
                 consultant before there is a case, or for anything else. -->
            <ModulesUserConsultantSearch />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
// The match endpoint is part of the inquiry pipeline, so the same gate.
definePageMeta({ middleware: 'require-page', requiredPage: 'Inquiries', requiredCompanyFlag: 'inquiry_pipeline_enabled' })

const runtimeConfig = useRuntimeConfig()

const breadcrumbLinks = [
    {
        name: 'consultantMatch.generalTitle',
        translate: true,
        href: '/consultants',
    },
]
</script>
