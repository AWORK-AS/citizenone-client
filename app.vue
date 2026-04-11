<template>
	<NuxtLayout>
		<!-- Google Tag Manager (noscript) -->
		<noscript>
			<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NHM44MFT" height="0" width="0"
				style="display:none;visibility:hidden"></iframe>
		</noscript>
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
		{
			hid: 'gtm',
			type: 'text/javascript',
			innerHTML: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','GTM-NHM44MFT');`
		},
	],
	noscript: [
		{
			hid: 'gtm-noscript',
			innerHTML: `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NHM44MFT"
        height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`
		}
	]
})
</script>