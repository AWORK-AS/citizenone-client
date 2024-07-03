<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('dutySchedules.dutySchedules') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('dutySchedules.dutySchedules') }}</template>

            <div>

            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
</script>