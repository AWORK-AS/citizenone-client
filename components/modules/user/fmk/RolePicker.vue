<script setup lang="ts">
import { shallowRef } from 'vue'
import type { FmkLoginChoice } from '@/composables/useFmkLogin'

/**
 * A staff member with several national roles or authorisations acts as one
 * of them on FMK; the SOSI ID card holds exactly one.
 */
const props = defineProps<{ choices: FmkLoginChoice[], pending: boolean }>()
const emit = defineEmits<{ choose: [key: string] }>()

const selected = shallowRef<string | null>(props.choices[0]?.key ?? null)
</script>

<template>
    <section class="rounded-2xl border border-[#e2e8f0] bg-white px-4 py-5 sm:px-6" :aria-labelledby="'fmk-role-title'">
        <h2 id="fmk-role-title" class="text-base font-semibold text-[#1a2332]">{{ $t('fmk.login.chooseTitle') }}</h2>
        <p class="mt-1 text-sm text-[#64748b]">{{ $t('fmk.login.chooseText') }}</p>
        <fieldset class="mt-4 space-y-2">
            <legend class="sr-only">{{ $t('fmk.login.chooseTitle') }}</legend>
            <label v-for="choice in choices" :key="choice.key"
                class="flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors"
                :class="selected === choice.key ? 'border-[#2dbab2] bg-[#f0faf9]' : 'border-[#e2e8f0] hover:bg-[#f8fafc]'">
                <input v-model="selected" type="radio" name="fmk-role" :value="choice.key" class="size-4 accent-[#2dbab2]" />
                <span class="min-w-0">
                    <span class="block font-semibold text-[#1a2332]">{{ choice.label }}</span>
                    <span class="block text-xs text-[#64748b]">
                        {{ choice.type === 'authorisation' ? $t('fmk.login.authorisation') : $t('fmk.login.nationalRole') }}
                    </span>
                </span>
            </label>
        </fieldset>
        <FormButton buttonStyle="primary" class="mt-4 rounded-md" :disabled="!selected || pending" @click="selected && emit('choose', selected)">
            {{ $t('fmk.login.chooseButton') }}
        </FormButton>
    </section>
</template>
