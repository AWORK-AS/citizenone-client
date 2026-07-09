import DOMPurify from 'dompurify'

/**
 * Audit C-07: sanitize externally-sourced HTML before it is inserted into the
 * DOM. Email bodies, secured-mail / caseworker / chat messages, report bodies
 * and assistant output are all rendered from content the app does not control.
 * Rendered raw (the previous `v-html`), a malicious sender could run script in
 * our origin and - because the API token lives in localStorage - steal it and
 * take over the account. `v-safe-html` runs every such string through DOMPurify.
 */
export default defineNuxtPlugin((nuxtApp) => {
  // Make links inside sanitized HTML open safely (block reverse-tabnabbing).
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node instanceof HTMLElement && node.tagName === 'A' && node.getAttribute('href')) {
      node.setAttribute('target', '_blank')
      node.setAttribute('rel', 'noopener noreferrer')
    }
  })

  const sanitize = (value: unknown): string =>
    DOMPurify.sanitize(value == null ? '' : String(value), {
      USE_PROFILES: { html: true },
      ADD_ATTR: ['target'],
    })

  const setHtml = (el: HTMLElement, value: unknown) => {
    el.innerHTML = sanitize(value)
  }

  nuxtApp.vueApp.directive('safe-html', {
    mounted: (el: HTMLElement, binding) => setHtml(el, binding.value),
    updated: (el: HTMLElement, binding) => setHtml(el, binding.value),
  })

  // Also expose as $sanitizeHtml / useNuxtApp().$sanitizeHtml for imperative use.
  return {
    provide: {
      sanitizeHtml: sanitize,
    },
  }
})
