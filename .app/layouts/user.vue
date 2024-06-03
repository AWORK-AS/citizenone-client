<template>
    <TairoCollapseLayout :collapse="collapse">
        <slot />
    </TairoCollapseLayout>
</template>

<script setup lang="ts">
const collapse = ref<boolean | undefined>(true)
</script>