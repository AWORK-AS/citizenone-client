<template>
    <div></div>
</template>

<script setup lang="ts">
// The catalogue now sits next to the invoices it prices, so this old address
// forwards rather than keeping a second copy of the same screen alive.
definePageMeta({
    middleware: [
        () => navigateTo({ path: '/invoicing', query: { tab: 'services' } }, { redirectCode: 301 }),
    ],
})
</script>
