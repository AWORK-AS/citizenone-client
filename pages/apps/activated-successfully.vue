<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('apps.apps') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <div class="mx-auto mt-10 w-full max-w-xl">
                <div class="ring-1 ring-gray-200 rounded-md p-8 xl:p-10">
                    <div class="mx-auto max-w-fit bg-green-600 rounded-full p-4 flex items-center justify-center">
                        <Icon name="ph:check-bold" class="h-7 w-7 text-white" aria-hidden="true" />
                    </div>
                    <div class="mt-4 text-center">
                        <h2 class="text-3xl font-extrabold text-gray-900">
                            {{ $t('apps.activation.activatedSuccessfully') }}!
                        </h2>
                        <p class="mt-2 text-sm text-gray-600">
                            {{ $t('apps.activation.activationSuccessMessage') }}.
                        </p>
                    </div>
                    <div class="mt-8">
                        <div class="mt-6 space-y-3">
                            <FormButton v-if="setupRoute" type="button" buttonStyle="primary" class="w-full"
                                @click="navigateTo(setupRoute)">
                                {{ $t('apps.activation.goToSetup') }}
                            </FormButton>
                            <FormButton type="submit" :buttonStyle="setupRoute ? 'cancel' : 'primary'" class="w-full"
                                @click="navigateTo('/overview')">
                                {{ $t('subscription.subscribed.goHome') }}
                            </FormButton>
                        </div>
                    </div>

                    <!-- Post-activation cross-sell: related apps in the same category -->
                    <ModulesUserAppCrossSell :categorySlug="category" :excludeUuid="exclude" />
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { appService } from '@/components/api/user/AppService'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const category = (route.query.category as string) || ''
const exclude = (route.query.exclude as string) || ''

// Apps with an in-product setup page the user can jump to after activation
const appSetupRoutes: Record<string, string> = {
    'surveys': '/forms',
}

const setupRoute = ref('')

onMounted(async () => {
    if (!exclude) return
    try {
        const response = await appService.getApp(exclude)
        const genericName = response?.data?.generic_name
        if (genericName && appSetupRoutes[genericName]) {
            setupRoute.value = appSetupRoutes[genericName]
        }
    } catch {
        // No setup shortcut; the home button still works
    }
})

const breadcrumbLinks = [
    {
        name: 'apps.apps',
        translate: true,
        href: '/apps',
    },
    {
        name: 'apps.activation.activationSuccessful',
        translate: true,
        href: `/apps/activated-successfully`,
    },
]
</script>