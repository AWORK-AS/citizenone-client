<template>
    <textarea ref="textarea" type="text" :name="props.name" :autocomplete="props.name"
        class="appearance-none block w-full p-4 border border-gray-200 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm resize-none"
        :placeholder="props.placeholder" :rows="props.rows"
        :autocapitalize="props.autoCapitalize ? 'sentences' : undefined"
        @input="updateValue($event)" @focus="resize">{{ props.modelValue }}</textarea>
</template>

<script setup lang="ts">
import { shouldCapitalizeLastLetter } from '@/utils/auto-capitalize'

const props = defineProps({
    name: {
        type: String,
        required: true,
    },
    modelValue: {
        type: String,
        required: false,
    },
    placeholder: {
        type: String,
        required: true,
    },
    rows: {
        type: Number,
        required: false,
        default: 4,
    },
    // Journal notes: capitalize the first letter of the text and of every
    // sentence while typing (see utils/auto-capitalize.ts).
    autoCapitalize: {
        type: Boolean,
        required: false,
        default: false,
    },
})

const emit = defineEmits(['update:modelValue'])

const textarea = ref<HTMLTextAreaElement | null>(null)

// Height of the box at its given `rows`, so growing never turns into shrinking
// below the size the form was designed with.
const minHeight = ref(0)

// Past this, the box stops growing and scrolls internally instead. Without a
// cap, a single very long answer (a pasted document, or - as found testing
// this against the medicine-comments grid - a wall of repeated characters)
// grows the box to match its full content, which inside a table cell or a
// small modal pushes every sibling element off screen and swallows the whole
// layout rather than just the one field. 480px is roughly 20-24 lines,
// generous for a real answer without ever dominating the page around it.
const MAX_HEIGHT_PX = 480

/**
 * A fixed-height box hides everything past its last visible row, which is how
 * long answers on a status form ended up scrolled out of sight while being
 * written. The box grows with the text instead, up to MAX_HEIGHT_PX, and
 * never shrinks below the `rows` it was given.
 */
function resize() {
    const el = textarea.value

    // An element that is not rendered yet (a modal that has not opened) reports
    // no height at all, and measuring it would collapse the box to nothing.
    if (!el || el.offsetParent === null) {
        return
    }

    if (!minHeight.value) {
        minHeight.value = el.offsetHeight
    }

    // scrollHeight covers content and padding but not the border, and the box is
    // border-box - without adding it back the last line loses a couple of pixels.
    const style = window.getComputedStyle(el)
    const border = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth)

    el.style.height = 'auto'
    const contentHeight = Math.max(el.scrollHeight + border, minHeight.value)
    el.style.height = `${Math.min(contentHeight, MAX_HEIGHT_PX)}px`
    el.style.overflowY = contentHeight > MAX_HEIGHT_PX ? 'auto' : 'hidden'
}

// Where the last automatic capital was written, so undoing it can be told
// apart from any other undo.
let lastCapitalizedAt = -1

function updateValue(event: any) {
    if (props.autoCapitalize) {
        capitalizeTypedLetter(event)
    }

    emit('update:modelValue', event.target.value)
    resize()
}

/**
 * Turns the letter just typed into a capital when it opens a sentence.
 *
 * It is replaced through execCommand so the browser's own undo stack keeps
 * it: Ctrl+Z right after brings the lowercase letter back. Pasted text and
 * IME compositions are left alone.
 */
function capitalizeTypedLetter(event: InputEvent) {
    const el = event.target as HTMLTextAreaElement

    // Undoing the capital leaves the restored lowercase letter selected, so
    // the next keystroke would overwrite it - put the caret back after it.
    if (event.inputType === 'historyUndo' && el.selectionStart === lastCapitalizedAt
        && el.selectionEnd === lastCapitalizedAt + 1) {
        el.setSelectionRange(el.selectionEnd, el.selectionEnd)
        lastCapitalizedAt = -1

        return
    }

    if (event.inputType !== 'insertText' || event.isComposing || el.selectionStart !== el.selectionEnd) {
        return
    }

    const caret = el.selectionStart
    const before = el.value.slice(0, caret)
    const lineStart = before.lastIndexOf('\n') + 1

    if (!shouldCapitalizeLastLetter(before.slice(lineStart))) {
        return
    }

    const upper = before.charAt(caret - 1).toLocaleUpperCase()

    lastCapitalizedAt = caret - 1
    el.setSelectionRange(caret - 1, caret)

    if (!document.execCommand('insertText', false, upper)) {
        el.setRangeText(upper, caret - 1, caret, 'end')
    }
}

onMounted(resize)

// The value is often filled in after mount (an existing response being loaded),
// and the box has to match what it is showing at that point too.
watch(() => props.modelValue, () => nextTick(resize))
</script>
