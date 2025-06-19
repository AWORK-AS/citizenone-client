<template>
    <div class="multi-tag-input">
        <div class="bg-white flex flex-wrap gap-1 items-center border border-primary rounded-md px-4 py-1">
            <span v-for="(tag, index) in tags" :key="index"
                class="bg-primary text-white px-2 py-1 rounded text-sm flex items-center">
                {{ tag }}
                <button type="button" class="ml-1 text-white" @click="removeTag(index)">×</button>
            </span>

            <input type="text" :id="props.id" :name="props.name"
                class="flex-grow min-w-[150px] h-8 border-none outline-none text-sm"
                :placeholder="tags.length === 0 ? props.placeholder : ''" v-model="inputValue" @keydown="handleKeydown"
                @blur="addTag" autocomplete="off" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
    id: { type: String, required: false },
    maxLength: { type: Number, required: false },
    name: { type: String, required: true },
    modelValue: {
        type: Array as () => string[],
        default: () => [],
    },
    placeholder: { type: String, required: true },
})

const emit = defineEmits(['update:modelValue'])

const tags = ref([...props.modelValue])
const inputValue = ref('')

watch(() => props.modelValue, (newVal) => {
    tags.value = [...newVal]
})

function addTag() {
    const trimmed = inputValue.value.trim()
    if (trimmed && !tags.value.includes(trimmed)) {
        tags.value.push(trimmed)
        emit('update:modelValue', tags.value)
    }
    inputValue.value = ''
}

function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ',' || event.key === ' ') {
        event.preventDefault()
        addTag()
    } else if (event.key === 'Backspace' && inputValue.value === '') {
        tags.value.pop()
        emit('update:modelValue', tags.value)
    }
}

function removeTag(index: number) {
    tags.value.splice(index, 1)
    emit('update:modelValue', tags.value)
}
</script>

<style scoped>
.multi-tag-input input:focus {
    outline: none;
}
</style>