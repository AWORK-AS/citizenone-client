<template>
    <div>

        <Head>
            <Title>Protocols - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>

        <h1>Protocols</h1>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'user',
    title: 'Protocols',
})

const runtimeConfig = useRuntimeConfig()
</script>