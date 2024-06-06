<template>
    <div>

        <Head>
            <Title>Log - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>

        <CitizenDetails>
            Log
        </CitizenDetails>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'user',
    title: 'Log',
})

const runtimeConfig = useRuntimeConfig()
</script>