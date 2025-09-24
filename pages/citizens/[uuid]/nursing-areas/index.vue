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
                    <div class="mt-8 space-y-5">
                        <Disclosure as="div" v-slot="{ open }"
                            class="bg-white ring-1 ring-gray-200 rounded-md border-t-3 border-secondary"
                            :defaultOpen="open === 'nursing-professional-records' ? true : false">
                            <DisclosureButton class="w-full flex justify-between items-center text-left px-5 py-6">
                                <div class="flex items-center gap-x-2">
                                    <h3 class="font-semibold text-sm">
                                        {{ $t('citizens.nursingAreas.nursingProfessionalRecords') }}
                                    </h3>
                                </div>
                                <Icon :name="open ? 'ic:round-keyboard-arrow-up' : 'ic:round-keyboard-arrow-down'"
                                    class="w-5 h-5" />
                            </DisclosureButton>

                            <DisclosurePanel as="dd" class="px-5 pb-5">
                                <ModulesUserCitizenNursingAreasNursingProfessionalRecordList />
                            </DisclosurePanel>
                        </Disclosure>

                        <Disclosure as="div" v-slot="{ open }"
                            class="bg-white ring-1 ring-gray-200 rounded-md border-t-3 border-secondary"
                            :defaultOpen="open === 'treatments' ? true : false">
                            <DisclosureButton class="w-full flex justify-between items-center text-left px-5 py-6">
                                <div class="flex items-center gap-x-2">
                                    <h3 class="font-semibold text-sm">
                                        <h3 class="font-semibold">
                                            {{ $t('citizens.treatments.treatments') }}
                                        </h3>
                                    </h3>
                                </div>
                                <Icon :name="open ? 'ic:round-keyboard-arrow-up' : 'ic:round-keyboard-arrow-down'"
                                    class="w-5 h-5" />
                            </DisclosureButton>

                            <DisclosurePanel as="dd" class="px-5 pb-5">
                                <ModulesUserCitizenTreatmentList />
                            </DisclosurePanel>
                        </Disclosure>

                        <Disclosure as="div" v-slot="{ open }"
                            class="bg-white ring-1 ring-gray-200 rounded-md border-t-3 border-secondary">
                            <DisclosureButton class="w-full flex justify-between items-center text-left px-5 py-6">
                                <div class="flex items-center gap-x-2">
                                    <h3 class="font-semibold text-sm">
                                        <h3 class="font-semibold">
                                            {{
                                                $t('citizens.nursingAreas.consentCompetenceOrCapacity.consentCompetenceOrCapacity')
                                            }}
                                        </h3>
                                    </h3>
                                </div>
                                <Icon :name="open ? 'ic:round-keyboard-arrow-up' : 'ic:round-keyboard-arrow-down'"
                                    class="w-5 h-5" />
                            </DisclosureButton>

                            <DisclosurePanel as="dd" class="px-5 pb-5">
                                <ModulesUserCitizenNursingAreasConsentCompetenceCapacityList />
                            </DisclosurePanel>
                        </Disclosure>

                        <Disclosure as="div" v-slot="{ open }"
                            class="bg-white ring-1 ring-gray-200 rounded-md border-t-3 border-secondary">
                            <DisclosureButton class="w-full flex justify-between items-center text-left px-5 py-6">
                                <div class="flex items-center gap-x-2">
                                    <h3 class="font-semibold text-sm">
                                        <h3 class="font-semibold">
                                            {{
                                                $t('citizens.nursingAreas.illnessAndFunctionalImpairment.illnessAndFunctionalImpairment')
                                            }}
                                        </h3>
                                    </h3>
                                </div>
                                <Icon :name="open ? 'ic:round-keyboard-arrow-up' : 'ic:round-keyboard-arrow-down'"
                                    class="w-5 h-5" />
                            </DisclosureButton>

                            <DisclosurePanel as="dd" class="px-5 pb-5">
                                <ModulesUserCitizenNursingAreasIllnessFunctionalImpairmentList />
                            </DisclosurePanel>
                        </Disclosure>

                        <Disclosure as="div" v-slot="{ open }"
                            class="bg-white ring-1 ring-gray-200 rounded-md border-t-3 border-secondary">
                            <DisclosureButton class="w-full flex justify-between items-center text-left px-5 py-6">
                                <div class="flex items-center gap-x-2">
                                    <h3 class="font-semibold text-sm">
                                        <h3 class="font-semibold">
                                            {{
                                                $t('citizens.nursingAreas.vitals.vitals')
                                            }}
                                        </h3>
                                    </h3>
                                </div>
                                <Icon :name="open ? 'ic:round-keyboard-arrow-up' : 'ic:round-keyboard-arrow-down'"
                                    class="w-5 h-5" />
                            </DisclosureButton>

                            <DisclosurePanel as="dd" class="px-5 pb-5">
                                <ModulesUserCitizenNursingAreasVitalList />
                            </DisclosurePanel>
                        </Disclosure>

                    </div>
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useCustomPagesStore } from '@/store/custom-pages'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'

const customPagesStore = useCustomPagesStore() as any
const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const open = router?.currentRoute?.value?.query?.open
const breadcrumbLinks = [
    {
        name: 'citizens.nursingAreas.nursingProfessionalRecords',
        translate: true,
        href: `/citizens/${citizenUuid}/nursing-areas`,
    },
]
</script>