<template>
    <Modal size="4xl" :title="isEditMode ? $t('drive.documentEditor.title') : $t('drive.newDocument')"
        :show="props.isOpen" @close="close">
        <template #modal-body>
            <div class="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div class="mb-4">
                    <FormLabel for="document-name" :label="$t('drive.documentEditor.documentName')" />
                    <FormTextField id="document-name" name="document-name"
                        :placeholder="$t('drive.documentEditor.documentName')" v-model="documentName" />
                </div>

                <div class="document-editor">
                    <ckeditor :editor="editor" v-model="editorData" :config="editorConfig"></ckeditor>
                </div>
            </div>
            <div class="mt-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="emit('close')">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full" @click="save">
                        {{ !props.isEditMode ? $t('save') : $t('update') }}
                    </FormButton>
                </div>
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import ClassicEditor from "@ckeditor/ckeditor5-build-classic"

const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false,
    },
    initialData: {
        type: String,
        default: "",
    },
    initialName: {
        type: String,
        default: "",
    },
    isEditMode: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(["close", "save"])

const editor = ClassicEditor
const editorData = ref(props.initialData)
const documentName = ref(props.initialName)
const isLoading = ref(false)

const editorConfig = ref({
    toolbar: {
        items: [
            "heading",
            "|",
            "bold",
            "italic",
            "link",
            "|",
            "bulletedList",
            "numberedList",
            "|",
            "blockQuote",
            "insertTable",
            "|",
            "undo",
            "redo",
        ],
        shouldNotGroupWhenFull: true,
    },
});

watch(
    () => props.isOpen,
    (newVal) => {
        if (newVal) {
            editorData.value = processIncomingData(props.initialData);
            documentName.value = props.initialName;
            console.log(
                "📄 Loading document content:",
                props.initialData?.substring(0, 500),
            );
        }
    },
);

const close = () => {
    emit("close");
};

const save = () => {
    isLoading.value = true;

    const sanitizedContent = sanitizeContent(editorData.value);

    emit("save", {
        name: documentName.value,
        content: sanitizedContent,
    });
    setTimeout(() => (isLoading.value = false), 1000);
};

const sanitizeContent = (html: string) => {
    if (!html) return "";
    let sanitized = html;

    sanitized = sanitized.replace(
        /font-family:\s*['"]([^'"]+)['"]/gi,
        (match, fontName) => {
            return `font-family:${fontName}`;
        },
    );

    sanitized = sanitized.replace(
        /font-size:\s*([\d\.]+)(px|pt)/gi,
        (match, value, unit) => {
            if (unit.toLowerCase() === "px") {
                const points = Math.round(parseFloat(value) * 0.75);
                return `font-size:${points}pt`;
            }
            return match; // Keep pt as is
        },
    );

    return sanitized;
};

const processIncomingData = (html: string) => {
    if (!html) return "";
    let processed = html;

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
    };

    Object.entries(fontMap).forEach(([key, value]) => {
        const safeRegex = new RegExp(
            `(font-family:\\s*)([^"';]*${key}[^"';]*)`,
            "gi",
        );
        processed = processed.replace(safeRegex, `$1${value}`);
    });

    processed = processed.replace(
        /font-size:\s*([\d\.]+)(pt|px)/gi,
        (match, value, unit) => {
            let points = parseFloat(value);
            if (unit.toLowerCase() === "px") {
                points = points * 0.75;
            }

            const validSizes = [
                8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72,
            ];
            const closest = validSizes.reduce((prev, curr) => {
                return Math.abs(curr - points) < Math.abs(prev - points) ? curr : prev;
            });

            return `font-size:${closest}pt`;
        },
    );

    console.log("🔄 Processed Data:", processed.substring(0, 500));
    return processed;
};
</script>

<style scoped src="~/assets/css/editor-styles.css"></style>
