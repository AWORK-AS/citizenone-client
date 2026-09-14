<template>
    <div></div>
</template>

<script setup lang="ts">
// The three economy screens are one area with tabs now, so the old address
// forwards rather than keeping a second copy of the same page alive.
definePageMeta({
    middleware: [
        () => navigateTo({ path: '/economy', query: { tab: 'revenue' } }, { redirectCode: 301 }),
    ],
})
</script>
