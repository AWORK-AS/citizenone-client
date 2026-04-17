export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.directive('click-outside', {
        mounted(el, binding) {
            el._clickOutsideHandler = (event: MouseEvent) => {
                if (!el.contains(event.target as Node)) {
                    binding.value(event)
                }
            }
            document.addEventListener('click', el._clickOutsideHandler)
        },
        unmounted(el) {
            document.removeEventListener('click', el._clickOutsideHandler)
            delete el._clickOutsideHandler
        },
    })
})
