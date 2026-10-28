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
                        <ModulesUserCitizenBreadcrumbTrail />
                    </template>
                </Breadcrumb>
            </template>


            <div class="space-y-5">

                <ModulesUserCitizenDetailsHeader />
                <ModulesUserCitizenJournalTabs />

                <div>
                    <div class="mt-8 space-y-5">
                        <ModulesUserCitizenNursingAreasAreaOverview :citizenUuid="String(citizenUuid)" />

                        <Disclosure as="div" v-slot="{ open }" :key="'laegejournal-' + openSection"
                            class="bg-white ring-1 ring-gray-200 rounded-md border-t-3 border-secondary"
                            :defaultOpen="openSection === 'laegejournal'">
                            <DisclosureButton class="w-full flex justify-between items-center text-left px-5 py-6">
                                <div class="flex items-center gap-x-2">
                                    <h3 class="font-semibold text-sm">
                                        {{ $t('citizens.nursingAreas.doctorJournals') }}
                                    </h3>
                                </div>
                                <Icon :name="open ? 'ic:round-keyboard-arrow-up' : 'ic:round-keyboard-arrow-down'"
                                    class="w-5 h-5" />
                            </DisclosureButton>

                            <DisclosurePanel as="dd" class="px-5 pb-5">
                                <ModulesUserCitizenJournalMedicalRecordList />
                            </DisclosurePanel>
                        </Disclosure>

                        <Disclosure as="div" v-slot="{ open }" :key="'npr-' + openSection"
                            class="bg-white ring-1 ring-gray-200 rounded-md border-t-3 border-secondary"
                            :defaultOpen="openSection === 'nursing-professional-records'">
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

                        <Disclosure as="div" v-slot="{ open }" :key="'treatments-' + openSection"
                            id="treatments-disclosure"
                            class="bg-white ring-1 ring-gray-200 rounded-md border-t-3 border-secondary"
                            :defaultOpen="openSection === 'treatments'">
                            <DisclosureButton class="w-full flex justify-between items-center text-left px-5 py-6">
                                <div class="flex items-center gap-x-2">
                                    <h3 class="font-semibold text-sm">
                                        {{ $t('citizens.treatments.treatments') }}
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
                                        {{
                                            $t('citizens.nursingAreas.consentCompetenceOrCapacity.consentCompetenceOrCapacity')
                                        }}
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
                                        {{
                                            $t('citizens.nursingAreas.illnessAndFunctionalImpairment.illnessAndFunctionalImpairment')
                                        }}
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
                                        {{
                                            $t('citizens.nursingAreas.vitals.vitals')
                                        }}
                                    </h3>
                                </div>
                                <Icon :name="open ? 'ic:round-keyboard-arrow-up' : 'ic:round-keyboard-arrow-down'"
                                    class="w-5 h-5" />
                            </DisclosureButton>

                            <DisclosurePanel as="dd" class="px-5 pb-5">
                                <ModulesUserCitizenNursingAreasVitalList />
                            </DisclosurePanel>
                        </Disclosure>

                        <Disclosure as="div" v-slot="{ open }"
                            class="bg-white ring-1 ring-gray-200 rounded-md border-t-3 border-secondary">
                            <DisclosureButton class="w-full flex justify-between items-center text-left px-5 py-6">
                                <div class="flex items-center gap-x-2">
                                    <h3 class="font-semibold text-sm">
                                        {{
                                            $t('citizens.nursingAreas.checklists.checklists')
                                        }}
                                    </h3>
                                </div>
                                <Icon :name="open ? 'ic:round-keyboard-arrow-up' : 'ic:round-keyboard-arrow-down'"
                                    class="w-5 h-5" />
                            </DisclosureButton>

                            <DisclosurePanel as="dd" class="px-5 pb-5">
                                <ModulesUserCitizenNursingAreasChecklistList />
                            </DisclosurePanel>
                        </Disclosure>

                    </div>
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { useCustomPagesStore } from '@/store/custom-pages'

const customPagesStore = useCustomPagesStore() as any
const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const route = useRoute()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const openSection = computed(() => route.query.open as string)
const breadcrumbLinks = [
    {
        name: 'citizens.nursingAreas.nursingProfessionalRecords',
        translate: true,
        href: `/citizens/${citizenUuid}/nursing-areas`,
    },
]
</script>