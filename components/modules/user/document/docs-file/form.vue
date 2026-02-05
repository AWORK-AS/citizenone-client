<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <div class="space-y-3">
            <div class="mb-4">
                <FormLabel for="document-name" :label="$t('drive.documentEditor.documentName')" />
                <FormTextField id="document-name" name="document-name"
                    :placeholder="$t('drive.documentEditor.documentName')" v-model="state.formDocument.name" />
                <FormError :error="v$?.formDocument?.name?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.name?.[0]" />
            </div>
            <div class="space-y-1">
                <div class="document-editor">
                    <ckeditor :editor="editor" v-model="state.formDocument.content" :config="editorConfig"></ckeditor>
                </div>
                <FormError :error="v$?.formDocument?.content?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.content?.[0]" />
            </div>
            <div>
                <div class="w-fit flex items-center cursor-pointer"
                    @click="state.formDocument.is_admin_access = !state.formDocument.is_admin_access">
                    <FormCheckbox :value="state.formDocument.is_admin_access" />
                    {{ $t('citizens.documents.form.forAdministratorsOnly') }}
                </div>
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="emit('closeModal')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full">
                    {{ props.formType === 'create' ? $t('save') :
                        $t('update') }}
                </FormButton>
            </div>
        </div>
    </form>
</template>

<script setup lang="ts">
import ClassicEditor from "@ckeditor/ckeditor5-build-classic"
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedDocument: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['closeModal', 'submitForm', 'isPageLoading'])
const { t } = useI18n()
const editor = ClassicEditor
const editorConfig = ref({
    toolbar: {
        items: ['heading', '|', 'bold', 'italic', 'link', '|', 'bulletedList', 'numberedList', '|', 'blockQuote', 'insertTable', '|', 'undo', 'redo',],
        shouldNotGroupWhenFull: true,
    },
})

const state = reactive({
    formDocument: {
        name: '',
        content: '',
        is_admin_access: false,
    },
})

onMounted(() => {
    state.formDocument = {
        name: '',
        content: '',
        is_admin_access: false,
    }
})

watch(() => props.selectedDocument, (newValue: any) => {
    if (newValue != null) {
        state.formDocument = {
            name: newValue.name,
            content: newValue.content,
            is_admin_access: newValue.is_admin_access,
        }
        processContent()
    }
}, { deep: true })

const rules = computed(() => {
    return {
        formDocument: {
            content: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formDocument)
    }
}

function processContent() {
    if (!state.formDocument.content) return ""
    let processed = state.formDocument.content

    const fontMap = {
        "Times New Roman": "'Times New Roman'",
        "Courier New": "'Courier New'",
        "Lucida Sans Unicode": "'Lucida Sans Unicode'",
        "Trebuchet MS": "'Trebuchet MS'",
        "Comic Sans MS": "'Comic Sans MS'",
        Arial: "Arial",
        Georgia: "Georgia",
        Tahoma: "Tahoma",
        Verdana: "Verdana",
        Impact: "Impact",
    }

    Object.entries(fontMap).forEach(([key, value]) => {
        const safeRegex = new RegExp(
            `(font-family:\\s*)([^"';]*${key}[^"';]*)`,
            "gi",
        )
        processed = processed.replace(safeRegex, `$1${value}`)
    })

    processed = processed.replace(
        /font-size:\s*([\d\.]+)(pt|px)/gi,
        (match, value, unit) => {
            let points = parseFloat(value)
            if (unit.toLowerCase() === "px") {
                points = points * 0.75
            }

            const validSizes = [
                8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72,
            ]
            const closest = validSizes.reduce((prev, curr) => {
                return Math.abs(curr - points) < Math.abs(prev - points) ? curr : prev
            })

            return `font-size:${closest}pt`
        },
    )
    state.formDocument.content = processed
}
</script>

<style scoped src="~/assets/css/editor-styles.css"></style>