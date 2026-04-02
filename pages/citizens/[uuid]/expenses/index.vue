<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.wallets.expenses.expenses') }} - {{ runtimeConfig?.public?.appName }}</Title>
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

            <template #header>{{ $t('citizens.expenses.expenses') }}</template>

            <div class="space-y-5">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesUserCitizenDetailsHeader />
                <ModulesUserCitizenJournalTabs />
                <ModulesUserCitizenWalletTabs />

                <div>
                    <p class="text-gray-600">{{ $t('citizens.wallets.expenses.comingSoon') }}</p>
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { useCustomPagesStore } from '@/store/custom-pages'

const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()
const customPagesStore = useCustomPagesStore() as any
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid as any

const breadcrumbLinks = [
    {
        name: 'citizens.wallets.wallets',
        translate: true,
        href: `/citizens/${citizenUuid}/wallets`,
    },
    {
        name: 'citizens.wallets.expenses.expenses',
        translate: true,
        href: `/citizens/${citizenUuid}/wallets/expenses`,
    },
]
</script>
