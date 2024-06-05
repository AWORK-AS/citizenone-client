<template>
    <div>

        <Head>
            <Title>Messages - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>

        <h1>Messages</h1>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'user',
    title: 'Messages',
})

const runtimeConfig = useRuntimeConfig()
</script>