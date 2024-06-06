<template>
    <div>

        <Head>
            <Title>Citizen Journal - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>

        <CitizenDetails>
            Citizen Journal
        </CitizenDetails>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'user',
    title: 'Citizen Journal',
})

const runtimeConfig = useRuntimeConfig()
</script>