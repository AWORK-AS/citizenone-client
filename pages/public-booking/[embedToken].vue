<template>
    <div class="hosted-page">
        <div class="hosted-page__inner">
            <WebsiteBookingWidget :api-base-url="runtimeConfig.public.apiBaseURL" :embed-token="embedToken"
                :locale="locale" />
        </div>
    </div>
</template>

<script setup lang="ts">
// The hosted-link distribution channel from the plan (option b: path-based
// on the existing app domain rather than a true booking.citizenone.dk
// subdomain, which needs reverse-proxy work outside this repo). Same widget
// component as the embed route - same config, same booking engine, just
// full-page instead of Shadow-DOM-mounted on a third-party site.
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
.hosted-page {
    min-height: 100vh;
    background: #f9fafb;
    display: flex;
    justify-content: center;
    padding: 3rem 1rem;
}

.hosted-page__inner {
    width: 100%;
    max-width: 480px;
}
</style>
