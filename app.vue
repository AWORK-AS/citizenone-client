<template>
	<NuxtLayout>
		<NuxtPage />
		<!-- `classes` names the element the toast rules in main.css style. -->
		<notifications class="mt-24" classes="co-toast" />
	</NuxtLayout>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const runtimeConfig = useRuntimeConfig()
const { locale } = useI18n()

/**
 * The document had no lang attribute at all, so a screen reader pronounced
 * Danish with English rules. The app's locale codes are not language tags, so
 * they are mapped: dk is Danish, no is Norwegian Bokmål.
 */
const documentLanguage = computed<string>(() => {
	const tags: Record<string, string> = { dk: 'da', en: 'en', sv: 'sv', no: 'nb' }

	return tags[locale.value] ?? 'da'
})

useHead({
	htmlAttrs: {
		lang: documentLanguage,
	},
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