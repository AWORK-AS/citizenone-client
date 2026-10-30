<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('consultantMatch.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('consultantMatch.title') }}</template>

            <ModulesUserConsultantSearch :inquiryUuid="inquiryUuid" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'require-page', requiredPage: 'Inquiries', requiredCompanyFlag: 'inquiry_pipeline_enabled' })

const runtimeConfig = useRuntimeConfig()
const route = useRoute()

const inquiryUuid = String(route.params.inquiry_uuid)

const breadcrumbLinks = [
    {
        name: 'inquiries.inquiries',
        translate: true,
        href: '/inquiries',
    },
    {
        name: 'consultantMatch.title',
        translate: true,
        href: `/inquiries/${inquiryUuid}/match`,
    },
]
</script>
