<template>
    <div>

        <Head>
            <Title>Calendar - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>

        <h1>Calendar</h1>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'user',
    title: 'Calendar',
})

const runtimeConfig = useRuntimeConfig()
</script>