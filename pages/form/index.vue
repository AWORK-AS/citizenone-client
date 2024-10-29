<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>Form - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>Form</template>

            <div class="max-w-5xl mx-auto space-y-5">
                <div class="space-y-3 px-4 py-6 sm:p-8 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg">
                    <div class="space-y-1">
                        <FormLabel for="form_title" label="Form title" />
                        <FormTextField id="form_title" name="form_title" placeholder="Form title" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="form_description" label="Form description" />
                        <FormTextArea id="form_description" name="form_description" placeholder="Form description" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="form_title" label="Form title" />
                        <FormTextField id="form_title" name="form_title" placeholder="Form title" />
                    </div>
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
</script>