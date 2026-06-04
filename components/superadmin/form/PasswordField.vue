<template>
    <div class="relative">
        <input
            :type="showPassword ? 'text' : 'password'"
            :value="modelValue"
            :placeholder="placeholder"
            class="co-input pr-10"
            :class="hasError ? 'border-red-300 focus:border-red-400' : ''"
            v-bind="$attrs"
            @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        />
        <button
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-[#8891A4] hover:text-[#5C6478]"
            @click="showPassword = !showPassword"
        >
            <Icon :name="showPassword ? 'ph:eye-slash' : 'ph:eye'" class="w-4 h-4" />
        </button>
    </div>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

defineProps({
    modelValue: {
        type: String,
        default: '',
    },
    placeholder: {
        type: String,
        default: '',
    },
    hasError: {
        type: Boolean,
        default: false,
    },
})

defineEmits(['update:modelValue'])

const showPassword = ref(false)
</script>
