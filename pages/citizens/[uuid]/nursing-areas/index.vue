<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>
                    {{ $t('citizens.nursingAreas.nursingProfessionalRecords') }} -
                    {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #header>{{ $t('citizens.nursingAreas.nursingProfessionalRecords') }}</template>

            <div class="space-y-5">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesCitizenDetailsHeader />
                <ModulesCitizenJournalTabs />

                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <ModulesCitizenNursingProfessionalRecordTableData />
                    <ModulesCitizenTreatmentTableData />
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
</script>