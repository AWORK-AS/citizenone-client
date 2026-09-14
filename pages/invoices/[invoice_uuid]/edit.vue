<template>
    <div></div>
</template>

<script setup lang="ts">
// Client invoices now live under the invoicing module, so this old address
// forwards rather than keeping a second copy of the same screen alive.
definePageMeta({
    middleware: [
        () => navigateTo('/invoicing', { redirectCode: 301 }),
    ],
})
</script>
