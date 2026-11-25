<script setup lang="ts">
/**
 * Shown when FMK needs the staff member's own login. Private care providers
 * reach FMK through MitID Erhverv (via SEB), so FMK and the citizen's MinLog
 * show exactly who looked (GK 8).
 */
defineProps<{ pending: boolean }>()
const emit = defineEmits<{ login: [] }>()
</script>

<template>
    <section class="rounded-2xl border border-[#e2e8f0] bg-white px-6 py-10 text-center" :aria-label="$t('fmk.login.title')">
        <Icon name="ph:identification-card" class="mx-auto size-10 text-[#1b6d8a]" aria-hidden="true" />
        <h2 class="mt-3 text-lg font-semibold text-[#1a2332]">{{ $t('fmk.login.title') }}</h2>
        <p class="mx-auto mt-1 max-w-lg text-sm text-[#64748b]">{{ $t('fmk.login.text') }}</p>
        <FormButton buttonStyle="primary" class="mt-5 rounded-md" :disabled="pending" @click="emit('login')">
            <Icon :name="pending ? 'ph:spinner' : 'ph:sign-in'" :class="['size-4', pending && 'motion-safe:animate-spin']" aria-hidden="true" />
            {{ pending ? $t('fmk.login.redirecting') : $t('fmk.login.button') }}
        </FormButton>
    </section>
</template>
