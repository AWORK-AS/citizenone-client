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

            <ModulesUserSettingsTab />

            <div class="mt-10 space-y-3">
                <Disclosure as="div" v-slot="{ open }"
                    class="bg-white ring-1 ring-gray-200 rounded-md border-t-3 border-secondary" :defaultOpen="true">
                    <DisclosureButton class="w-full flex justify-between items-center text-left px-5 py-6">
                        <div class="flex items-center gap-x-2">
                            <h3 class="font-semibold text-sm">
                                {{ $t('settings.profile.profile') }}
                            </h3>
                        </div>
                        <Icon :name="open ? 'ic:round-keyboard-arrow-up' : 'ic:round-keyboard-arrow-down'"
                            class="w-5 h-5" />
                    </DisclosureButton>

                    <DisclosurePanel as="dd" class="px-5 pb-5">
                        <ModulesUserSettingsProfile />
                    </DisclosurePanel>
                </Disclosure>
            </div>

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
</script>