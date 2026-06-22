<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('settings.tabs.import') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('settings.tabs.import') }}</template>

            <ModulesUserSettingsTab />

            <div class="mt-8 max-w-2xl">
                <div class="card">
                    <div class="flex items-start gap-x-4">
                        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Icon name="ph:download-simple" class="h-6 w-6" />
                        </div>
                        <div>
                            <h3 class="font-semibold text-slate-900">Importér fra et andet system</h3>
                            <p class="mt-1 text-sm text-slate-500">
                                Migrér borgere, ansatte, journaler og vagtplaner fra jeres nuværende system via CSV eller Excel.
                                I uploader filen, kobler kolonnerne til CitizenOne, og importerer.
                            </p>
                            <div class="mt-4" v-if="isAtLeast('Admin')">
                                <FormButton buttonStyle="primary" @click="state.importOpen = true">
                                    <Icon name="ph:arrows-merge" class="h-4 w-4" aria-hidden="true" />
                                    Start import
                                </FormButton>
                            </div>
                            <p v-else class="mt-4 text-sm text-amber-600">Kun administratorer kan importere data.</p>
                        </div>
                    </div>
                </div>
            </div>

            <ModulesUserCitizenModalImportMapper :isModalOpen="state.importOpen"
                @close="state.importOpen = false" />

        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { usePermissions } from '@/composables/usePermissions'

const runtimeConfig = useRuntimeConfig()
const { isAtLeast } = usePermissions()

const state = reactive({
    importOpen: false,
})

const breadcrumbLinks = [
    {
        name: 'settings.tabs.import',
        translate: true,
        href: '/settings/import',
    },
]
</script>
