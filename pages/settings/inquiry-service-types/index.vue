<template>
    <div></div>
</template>

<script setup lang="ts">
// Service types are kept on the paragraphs now (Paragraffer & indsatstyper), so
// this old address forwards rather than keeping a second list alive.
definePageMeta({
    middleware: [
        () => navigateTo('/settings/sections', { redirectCode: 301 }),
    ],
})
</script>
