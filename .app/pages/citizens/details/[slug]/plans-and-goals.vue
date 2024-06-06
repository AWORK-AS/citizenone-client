<template>
    <div>

        <Head>
            <Title>Plans and Goals - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>

        <CitizenDetails>
            Plans and Goals
        </CitizenDetails>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'user',
    title: 'Plans and Goals',
})

const runtimeConfig = useRuntimeConfig()
</script>