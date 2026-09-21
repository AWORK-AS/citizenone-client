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

// Desktop only: citizenone://citizens/<uuid>/journals etc. maps 1:1 onto our
// own routes (same path, just a custom-protocol prefix instead of https://
// app.citizenone.dk), so a link from an email/calendar invite opens straight
// into the already-running app instead of another browser tab.
// Desktop only: the Dock menu, ⌘, and ⌘⇧N are built by the shell, which has
// no way of knowing whether the person signed in is staff or a relative. It
// does now, and it stops offering them staff routes.
useDesktopPrincipal()

let unsubscribeDeepLink: (() => void) | null = null
onMounted(() => {
	const bridge = (window as any).citizenOneDesktop
	if (!bridge?.isDesktop) return
	unsubscribeDeepLink = bridge.onDeepLink((url: string) => {
		const path = url.replace(/^citizenone:\/\//, '/')
		// Belt-and-suspenders: navigateTo() without { external: true } won't
		// actually leave the app for a bare string (Nuxt requires that flag
		// before treating anything as an external redirect), but this
		// shouldn't depend on that framework behaviour rather than validating
		// its own input - reject anything that isn't a plain single-leading-
		// slash path (rules out a crafted citizenone:///evil.com producing
		// a protocol-relative //evil.com after the prefix strip).
		if (!/^\/[^/]/.test(path)) return
		navigateTo(path)
	})
})
onUnmounted(() => unsubscribeDeepLink?.())
</script>