<template>
	<input type="color" :id="props.id" :value="props.modelValue" @input="updateColor($event)" class="cursor-pointer" />
</template>

<script setup lang="ts">
const emit = defineEmits(['update:modelValue'])

const props = defineProps({
	id: {
		type: String,
		required: false,
	},
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