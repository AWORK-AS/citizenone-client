<template>
    <div>

        <Head>
            <Title>Documents - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>

        <CitizenDetails>
            Documents
        </CitizenDetails>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'user',
    title: 'Documents',
})

const runtimeConfig = useRuntimeConfig()
</script>