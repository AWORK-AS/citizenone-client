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
			src: 'https://www.googletagmanager.com/gtag/js?id=AW-16858750370',
			async: true
		},
		{
			children: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){ dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', 'AW-16858750370');
      `
		},
		{
			id: "awork-cmp",
			src: runtimeConfig.public.cmp,
			async: true,
			"data-settings-id": "0f0abd55-82b8-4068-802d-af747735874a",
		},
	],
})
</script>