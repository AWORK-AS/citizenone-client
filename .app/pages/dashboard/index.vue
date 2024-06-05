<template>
    <div>

        <Head>
            <Title>Dashboard - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>

        <h1>Dashboard</h1>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'user',
    title: 'Dashboard',
})

const runtimeConfig = useRuntimeConfig()
</script>