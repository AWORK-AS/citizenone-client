<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('Catalog') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('Catalog') }}</template>

            <LazyModulesCatalogTab/>

            <div class="mt-10">

            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">

</script>