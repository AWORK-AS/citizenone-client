<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('apps.apps') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <div class="isolate mx-auto mt-10 grid max-w-lg">
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
                        <div class="mt-6">
                            <FormButton type="submit" buttonStyle="primary" class="w-full"
                                @click="navigateTo('/overview')">
                                {{ $t('subscription.subscribed.goHome') }}
                            </FormButton>
                        </div>
                    </div>
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()

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