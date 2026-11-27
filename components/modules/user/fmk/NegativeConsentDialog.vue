<script setup lang="ts">
import { shallowRef, watch } from 'vue'

/**
 * GK 4.3: staff may see privacy-marked medication only when they state why:
 * the citizen has agreed (today), or værdispring (urgent need to protect the
 * citizen's life or health). The choice is sent to FMK and logged.
 */
const props = defineProps<{ show: boolean, pending?: boolean }>()
const emit = defineEmits<{ close: [], confirm: [reason: 'consent' | 'emergency'] }>()

const reason = shallowRef<'consent' | 'emergency' | null>(null)
watch(() => props.show, (open) => { if (open) reason.value = null })

const options = ['consent', 'emergency'] as const
</script>

<template>
    <Modal :show="show" :title="$t('fmk.consent.title')" size="md" @close="emit('close')">
        <template #modal-body>
            <p class="text-sm text-[#64748b]">{{ $t('fmk.consent.intro') }}</p>
            <fieldset class="mt-4 space-y-2">
                <legend class="sr-only">{{ $t('fmk.consent.legend') }}</legend>
                <label v-for="option in options" :key="option"
                    class="flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors"
                    :class="reason === option ? 'border-[#0f4c75] bg-[#f0faf9]' : 'border-[#e2e8f0] hover:border-[#94a3b8]'">
                    <input v-model="reason" type="radio" name="fmk-consent" :value="option"
                        class="mt-1 size-4 accent-[#0f4c75] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2dbab2]" />
                    <span>
                        <span class="block text-sm font-semibold text-[#1a2332]">{{ $t(`fmk.consent.${option}.title`) }}</span>
                        <span class="block text-xs text-[#64748b]">{{ $t(`fmk.consent.${option}.text`) }}</span>
                    </span>
                </label>
            </fieldset>
            <p class="mt-4 flex items-start gap-2 rounded-lg border border-[#fed7aa] bg-[#fff7ed] px-3 py-2 text-xs text-[#9a3412]">
                <Icon name="ph:info" class="mt-px size-4 shrink-0" aria-hidden="true" />
                {{ $t('fmk.consent.logged') }}
            </p>
            <div class="mt-5 flex flex-wrap justify-end gap-2">
                <button type="button" @click="emit('close')"
                    class="rounded-lg border border-[#e2e8f0] bg-white px-4 py-2 text-sm font-semibold text-[#0f4c75] hover:border-[#0f4c75] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2dbab2]">
                    {{ $t('fmk.consent.cancel') }}
                </button>
                <button type="button" :disabled="!reason || pending" @click="reason && emit('confirm', reason)"
                    class="inline-flex items-center gap-2 rounded-lg bg-[#0f4c75] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1b6d8a] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2dbab2] focus-visible:ring-offset-2">
                    <Icon :name="pending ? 'ph:spinner' : 'ph:eye'" :class="['size-4', pending && 'motion-safe:animate-spin']" aria-hidden="true" />
                    {{ $t('fmk.consent.confirm') }}
                </button>
            </div>
        </template>
    </Modal>
</template>
