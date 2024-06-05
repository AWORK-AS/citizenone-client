<template>
    <div>

        <Head>
            <Title>Duty Schedule - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>

        <h1>Duty Schedule</h1>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'user',
    title: 'Duty Schedule',
})

const runtimeConfig = useRuntimeConfig()
</script>