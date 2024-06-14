<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>Calendar - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>Calendar</template>

            <div>

            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
</script>