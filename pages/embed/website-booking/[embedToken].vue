<template>
    <div class="embed-page">
        <WebsiteBookingWidget :api-base-url="runtimeConfig.public.apiBaseURL" :embed-token="embedToken"
            :locale="locale" />
    </div>
</template>

<script setup lang="ts">
// Chrome-less by design: no <NuxtLayout>, no header/footer. This route is
// what gets loaded inside the widget's own <iframe>-free Shadow DOM host
// when embedded (see /widget.js) and can also be visited directly for
// testing. It must render nothing but the widget itself.
import '@/components/modules/public/website-booking-widget.css'
import WebsiteBookingWidget from '@/components/modules/public/WebsiteBookingWidget.vue'

definePageMeta({
    layout: false,
})

const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const embedToken = computed(() => route.params.embedToken as string)
const locale = computed(() => (route.query.locale as string) || 'en')
</script>

<style scoped>
.embed-page {
    margin: 0;
    padding: 1rem;
}
</style>
