<template>
    <input :id="props.id" ref="inputRef" :value="props.modelValue" type="text" inputmode="numeric"
        autocomplete="one-time-code" maxlength="7" :placeholder="'000000'" :aria-label="props.label"
        class="w-full rounded-lg border border-[#e2e8f0] bg-white px-4 py-3 text-center text-2xl font-semibold tracking-[0.5em] text-[#1a2332] placeholder:text-[#e2e8f0] outline-none focus:border-[#2dbab2] focus:ring-2 focus:ring-[#2dbab2]/20 transition-colors"
        @input="onInput" @keydown.enter.prevent="emit('submit')" />
</template>

<script setup lang="ts">
import { isCompleteTotpCode, normalizeTotpCode } from '@/composables/staffTwoFactor'

const props = defineProps({
    modelValue: { type: String, default: '' },
    id: { type: String, default: 'two-factor-code' },
    label: { type: String, default: '' },
    autoSubmit: { type: Boolean, default: true },
})
const emit = defineEmits(['update:modelValue', 'submit'])

const inputRef = ref<HTMLInputElement | null>(null)

function onInput(event: Event) {
    const target = event.target as HTMLInputElement
    const code = normalizeTotpCode(target.value)
    target.value = code
    emit('update:modelValue', code)
    // Six digits typed or pasted: no need to reach for the button.
    if (props.autoSubmit && isCompleteTotpCode(code)) emit('submit')
}

function focus() {
    inputRef.value?.focus()
}

onMounted(() => nextTick(focus))

defineExpose({ focus })
</script>
