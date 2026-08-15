<template>
    <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Head>
            <Title>{{ $t('payment.cancelled.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>

        <div class="w-full max-w-md rounded-2xl bg-white px-6 py-10 text-center shadow-sm ring-1 ring-gray-900/5">
            <div class="mx-auto flex size-14 items-center justify-center rounded-full bg-gray-100">
                <Icon name="ph:x" class="size-7 text-gray-500" />
            </div>

            <h1 class="mt-5 text-xl font-semibold text-gray-900">{{ $t('payment.cancelled.title') }}</h1>
            <!-- Nothing was charged, and the invoice is untouched, so the only
                 thing to say is that the link still works. -->
            <p class="mt-2 text-sm text-gray-600">{{ $t('payment.cancelled.text') }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const runtimeConfig = useRuntimeConfig()
</script>
