<template>
    <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Head>
            <Title>{{ $t('payment.done.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>

        <div class="w-full max-w-md rounded-2xl bg-white px-6 py-10 text-center shadow-sm ring-1 ring-gray-900/5">
            <div class="mx-auto flex size-14 items-center justify-center rounded-full bg-green-100">
                <Icon name="ph:check" class="size-7 text-green-700" />
            </div>

            <h1 class="mt-5 text-xl font-semibold text-gray-900">{{ $t('payment.done.title') }}</h1>
            <p class="mt-2 text-sm text-gray-600">{{ $t('payment.done.text') }}</p>

            <!-- The receipt comes from the payment provider, and the invoice is
                 marked as paid on its own. Nothing here is asked of the payer. -->
            <p class="mt-6 text-xs text-gray-400">{{ $t('payment.done.receipt') }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
// The person paying is a patient, not a user of the system, so this page
// stands on its own without a layout or a login.
definePageMeta({ layout: false })

const runtimeConfig = useRuntimeConfig()
</script>
