<template>
	<NuxtLayout>
		<NuxtPage />
		<notifications class="mt-24" />
	</NuxtLayout>
</template>

<script setup lang="ts">
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
		}
	]
})
</script>
