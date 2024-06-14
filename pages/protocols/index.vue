<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>Protocols - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>Protocols</template>

            <div>

            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
</script>