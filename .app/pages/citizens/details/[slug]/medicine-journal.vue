<template>
    <div>

        <Head>
            <Title>Medicine Journal - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>

        <CitizenDetails>
            Medicine Journal
        </CitizenDetails>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'user',
    title: 'Medicine Journal',
})

const runtimeConfig = useRuntimeConfig()
</script>