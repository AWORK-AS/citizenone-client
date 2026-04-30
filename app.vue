<template>
	<NuxtLayout>
		<NuxtPage />
		<notifications class="mt-24" />
	</NuxtLayout>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
useHead({
	script: [
		{
			id: "awork-cmp",
			src: runtimeConfig.public.cmp,
			async: true,
			"data-settings-id": "0f0abd55-82b8-4068-802d-af747735874a",
		},
	],
})
</script>