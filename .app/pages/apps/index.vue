<template>
    <div>

        <Head>
            <Title>Apps - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>

        <h1>Apps</h1>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'user',
    title: 'Apps',
})

const runtimeConfig = useRuntimeConfig()
</script>