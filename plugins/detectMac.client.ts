export default defineNuxtPlugin(() => {
    const isMac = navigator.platform.toUpperCase().includes('MAC')
    if (!isMac) {
        document.body.classList.add('custom-scrollbar')
    }
})