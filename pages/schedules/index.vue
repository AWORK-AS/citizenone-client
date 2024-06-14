<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>Duty Schedules - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>Duty Schedules</template>

            <div>

            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
</script>