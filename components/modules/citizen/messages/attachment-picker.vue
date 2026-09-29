<template>
    <div class="space-y-2">
        <input ref="fileInput" type="file" multiple :accept="accept" class="hidden" @change="addFiles" />
        <button type="button" class="flex items-center gap-x-2 text-sm text-primary hover:underline"
            :disabled="props.modelValue.length >= maxFiles" @click="fileInput?.click()">
            <Icon name="ph:paperclip" class="w-5 h-5" />
            {{ $t('messages.attachFile') }}
        </button>
        <ul v-if="props.modelValue.length > 0" class="space-y-1">
            <li v-for="(file, index) in props.modelValue" :key="index"
                class="flex items-center justify-between gap-x-2 rounded-md border border-gray-200 px-3 py-1.5 text-sm">
                <span class="flex items-center gap-x-2 min-w-0">
                    <Icon name="ph:file" class="w-4 h-4 shrink-0 text-gray-500" />
                    <span class="truncate">{{ file.name }}</span>
                </span>
                <button type="button" class="text-gray-400 hover:text-red-500" @click="removeFile(index)">
                    <Icon name="ph:x" class="w-4 h-4" />
                </button>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
// Files picked for a message that has not been sent yet. The server takes at
// most five, of the kinds SendChatMessageStoreRequest::patientFileRules allows.
const maxFiles = 5
const accept = '.jpg,.jpeg,.png,.heic,.heif,.pdf,.doc,.docx,.mp4,.mov,.m4v'

const props = defineProps({
    modelValue: {
        type: Array as PropType<File[]>,
        required: true,
    },
})
const emit = defineEmits(['update:modelValue'])
const fileInput = ref<HTMLInputElement | null>(null)

function addFiles(event: Event) {
    const picked = Array.from((event.target as HTMLInputElement).files ?? [])
    emit('update:modelValue', [...props.modelValue, ...picked].slice(0, maxFiles))
    // Cleared so picking the same file again after removing it still fires change.
    if (fileInput.value) fileInput.value.value = ''
}

function removeFile(index: number) {
    emit('update:modelValue', props.modelValue.filter((_, i) => i !== index))
}
</script>
