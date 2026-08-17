<template>
    <div class="payment-page">
        <Head>
            <Title>{{ $t('payment.cancelled.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>

        <div class="payment-card">
            <img src="/img/logo.svg" class="payment-logo" alt="CitizenOne" />

            <div class="payment-mark">
                <Icon name="ph:x" class="size-8" />
            </div>

            <h1 class="payment-title">{{ $t('payment.cancelled.title') }}</h1>
            <!-- Nothing was charged, and the invoice is untouched, so the only
                 thing to say is that the link still works. -->
            <p class="payment-text">{{ $t('payment.cancelled.text') }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const runtimeConfig = useRuntimeConfig()
</script>

<style scoped>
.payment-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: linear-gradient(160deg, #0f2b46 0%, #0a1f33 60%, #071520 100%);
    font-family: Inter, sans-serif;
}

.payment-card {
    width: 100%;
    max-width: 420px;
    background: #ffffff;
    border-radius: 16px;
    padding: 40px 32px;
    text-align: center;
    box-shadow: 0 24px 60px rgba(7, 21, 32, 0.35);
}

.payment-logo {
    height: 28px;
    margin: 0 auto 28px auto;
}

.payment-mark {
    width: 64px;
    height: 64px;
    margin: 0 auto;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8fafc;
    color: #64748b;
}

.payment-title {
    margin-top: 20px;
    font-size: 20px;
    font-weight: 600;
    color: #1a2332;
}

.payment-text {
    margin-top: 12px;
    font-size: 14px;
    color: #64748b;
}
</style>
