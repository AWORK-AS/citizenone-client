<template>
  <input type="color" :value="modelValue" @input="updateColor($event)" />
</template>

<script setup lang="ts">
const emit = defineEmits(['update:modelValue'])

defineProps({
  modelValue: {
    type: String,
    required: true,
  },
})

const updateColor = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>