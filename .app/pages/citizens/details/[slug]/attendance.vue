<template>
    <div>

        <Head>
            <Title>Attendance - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>

        <CitizenDetails>
            Attendance
        </CitizenDetails>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'user',
    title: 'Attendance',
})

const runtimeConfig = useRuntimeConfig()
</script>