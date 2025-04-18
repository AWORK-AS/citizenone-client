<template>
    <div class="multi-email-input">
        <div class="flex flex-wrap gap-1 items-center border border-primary rounded-md px-2 py-1">
            <span v-for="(email, index) in emails" :key="index"
                class="bg-primary text-white px-2 py-1 rounded text-sm flex items-center">
                {{ email }}
                <button type="button" class="ml-1 text-white" @click="removeEmail(index)">×</button>
            </span>

            <input type="text" :id="props.id" :name="props.name"
                class="flex-grow min-w-[150px] h-8 border-none outline-none text-sm"
                :placeholder="emails.length === 0 ? props.placeholder : ''" v-model="inputValue"
                @keydown="handleKeydown" @blur="addEmail" autocomplete="off" />
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

const emails = ref([...props.modelValue])
const inputValue = ref('')

watch(() => props.modelValue, (newVal) => {
    emails.value = [...newVal]
})

function addEmail() {
    const trimmed = inputValue.value.trim()
    if (trimmed && isValidEmail(trimmed) && !emails.value.includes(trimmed)) {
        emails.value.push(trimmed)
        emit('update:modelValue', emails.value)
    }
    inputValue.value = ''
}

function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ',' || event.key === ' ') {
        event.preventDefault()
        addEmail()
    } else if (event.key === 'Backspace' && inputValue.value === '') {
        // Optionally remove last email on backspace
        emails.value.pop()
        emit('update:modelValue', emails.value)
    }
}

function removeEmail(index: number) {
    emails.value.splice(index, 1)
    emit('update:modelValue', emails.value)
}

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
</script>

<style scoped>
.multi-email-input input:focus {
    outline: none;
}
</style>