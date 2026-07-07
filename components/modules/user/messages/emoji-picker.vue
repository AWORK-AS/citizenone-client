<template>
    <div ref="wrapperRef" class="relative flex-shrink-0">
        <button type="button" @click.stop="toggle" :title="$t('messages.emoji')"
            class="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
            <Icon name="ph:smiley" class="w-5 h-5 text-gray-500" aria-hidden="true" />
        </button>

        <div v-if="open" @click.stop
            class="absolute bottom-12 left-0 z-50 w-72 rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
            <div class="grid grid-cols-8 gap-1 max-h-52 overflow-y-auto">
                <button v-for="emoji in emojis" :key="emoji" type="button" @click.stop="pick(emoji)"
                    class="h-8 w-8 rounded-md text-lg leading-none flex items-center justify-center hover:bg-gray-100 transition-colors">
                    {{ emoji }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue"

const emit = defineEmits(["select"])
const open = ref(false)
const wrapperRef = ref<HTMLElement | null>(null)

const emojis = [
    "😀", "😁", "😂", "🤣", "😊", "😍", "😘", "😎",
    "🤔", "😐", "😴", "😅", "🙂", "😉", "😇", "🥳",
    "😢", "😭", "😡", "😳", "🤗", "🤩", "😬", "🙃",
    "👍", "👎", "👏", "🙏", "💪", "🙌", "👋", "🤝",
    "✌️", "👌", "🔥", "✨", "⭐", "❤️", "🧡", "💚",
    "💙", "💜", "🎉", "🎂", "☕", "✅", "❌", "⚠️",
    "❓", "❗", "💡", "📌", "📎", "📅", "⏰", "💬",
]

function toggle() {
    open.value = !open.value
}

function pick(emoji: string) {
    emit("select", emoji)
    open.value = false
}

function onDocumentClick(event: MouseEvent) {
    if (open.value && wrapperRef.value && !wrapperRef.value.contains(event.target as Node)) {
        open.value = false
    }
}

onMounted(() => document.addEventListener("click", onDocumentClick, true))
onBeforeUnmount(() => document.removeEventListener("click", onDocumentClick, true))
</script>
