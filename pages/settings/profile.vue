<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('settings.tabs.profile') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('settings.tabs.profile') }}</template>

            <div class="mt-10 space-y-5">
                <!-- The profile itself is what the page is, so it is open and carries no
                     heading of its own: the page title already says Profile, and a card
                     that repeats it only pushed the first field further down. The
                     sections below it are extras, and stay foldable. -->
                <div class="bg-white ring-1 ring-gray-200 rounded-md border-t-3 border-secondary px-5 py-6">
                    <ModulesUserSettingsProfile :isFirstLoad="true" />
                </div>

                <Disclosure as="div" v-slot="{ open }"
                    class="bg-white ring-1 ring-gray-200 rounded-md border-t-3 border-secondary">
                    <DisclosureButton class="w-full flex justify-between items-center text-left px-5 py-6">
                        <div class="flex items-center gap-x-2">
                            <h3 class="font-semibold text-sm">
                                {{ $t('settings.profile.sidebarMenu.title') }}
                            </h3>
                        </div>
                        <Icon :name="open ? 'ic:round-keyboard-arrow-up' : 'ic:round-keyboard-arrow-down'"
                            class="w-5 h-5" />
                    </DisclosureButton>

                    <DisclosurePanel as="dd" class="px-5 pb-5">
                        <ModulesUserSettingsSidebarMenu />
                    </DisclosurePanel>
                </Disclosure>

                <Disclosure as="div" v-slot="{ open }"
                    class="bg-white ring-1 ring-gray-200 rounded-md border-t-3 border-secondary">
                    <DisclosureButton class="w-full flex justify-between items-center text-left px-5 py-6">
                        <div class="flex items-center gap-x-2">
                            <h3 class="font-semibold text-sm">
                                {{ $t('2fa.google2FactorAuthentication') }}
                            </h3>
                        </div>
                        <Icon :name="open ? 'ic:round-keyboard-arrow-up' : 'ic:round-keyboard-arrow-down'"
                            class="w-5 h-5" />
                    </DisclosureButton>

                    <DisclosurePanel as="dd" class="px-5 pb-5">
                        <ModulesUserSettings2faGoogle />
                    </DisclosurePanel>
                </Disclosure>

                <Disclosure as="div" v-slot="{ open }"
                    class="bg-white ring-1 ring-gray-200 rounded-md border-t-3 border-secondary">
                    <DisclosureButton class="w-full flex justify-between items-center text-left px-5 py-6">
                        <div class="flex items-center gap-x-2">
                            <h3 class="font-semibold text-sm">
                                {{ $t('settings.profile.shiftSubscription.title') }}
                            </h3>
                        </div>
                        <Icon :name="open ? 'ic:round-keyboard-arrow-up' : 'ic:round-keyboard-arrow-down'"
                            class="w-5 h-5" />
                    </DisclosureButton>

                    <DisclosurePanel as="dd" class="px-5 pb-5">
                        <p class="text-sm text-gray-500 mb-4">
                            {{ $t('settings.profile.shiftSubscription.description') }}
                        </p>
                        <FormButton buttonStyle="secondary" @click="state.isSubscribeOpen = true">
                            <Icon name="ph:calendar-plus" class="h-4 w-4 mr-1.5" aria-hidden="true" />
                            {{ $t('settings.profile.shiftSubscription.button') }}
                        </FormButton>
                    </DisclosurePanel>
                </Disclosure>
            </div>

            <ModulesUserMyCalendarModalSubscribe :isModalOpen="state.isSubscribeOpen" :dutySchedule="true"
                @close="state.isSubscribeOpen = false" />

        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'

const runtimeConfig = useRuntimeConfig()
const breadcrumbLinks = [
    {
        name: 'settings.tabs.profile',
        translate: true,
        href: '/settings/profile',
    },
]

const state = reactive({
    isSubscribeOpen: false
})
</script>