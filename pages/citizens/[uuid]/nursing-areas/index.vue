<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>
                    {{ $t('citizens.nursingAreas.nursingProfessionalRecords') }} -
                    {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks">
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo('/citizens')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ customPagesStore.getCustomPagesName?.citizens }}
                            </button>
                        </div>
                    </template>
                </Breadcrumb>
            </template>

            <template #header>{{ $t('citizens.nursingAreas.nursingProfessionalRecords') }}</template>

            <div class="space-y-5">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesUserCitizenDetailsHeader />
                <ModulesUserCitizenJournalTabs />

                <div>
                    <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                        <ModulesUserCitizenNursingProfessionalRecordList />
                        <ModulesUserCitizenTreatmentList />
                    </div>
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useCustomPagesStore } from '@/store/custom-pages'

const customPagesStore = useCustomPagesStore() as any
const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const breadcrumbLinks = [
    {
        name: 'citizens.nursingAreas.nursingProfessionalRecords',
        translate: true,
        href: `/citizens/${citizenUuid}/nursing-areas`,
    },
]
</script>