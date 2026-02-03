<template>
    <div
        v-if="isOpen"
        class="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
    >
        <div
            class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
        >
            <div
                class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                aria-hidden="true"
                @click="close"
            ></div>
 
            <span
                class="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
                >&#8203;</span
            >
 
            <div
                class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-7xl sm:w-full"
            >
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div class="flex justify-between items-center mb-4">
                        <h3
                            class="text-lg leading-6 font-medium text-gray-900"
                            id="modal-title"
                        >
                            {{
                                isEditMode
                                    ? $t("drive.documentEditor.title")
                                    : $t("drive.newDocument")
                            }}
                        </h3>
                        <button
                            @click="close"
                            type="button"
                            class="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <span class="sr-only">Close</span>
                            <Icon name="ph:x" class="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>
 
                    <div class="mb-4">
                        <FormLabel
                            for="document-name"
                            :label="$t('drive.documentEditor.documentName')"
                        />
                        <FormTextField
                            id="document-name"
                            name="document-name"
                            :placeholder="$t('drive.documentEditor.documentName')"
                            v-model="documentName"
                        />
                    </div>
 
                    <div class="document-editor">
                        <div id="toolbar-container"></div>
                        <ckeditor
                            :editor="editor"
                            v-model="editorData"
                            :config="editorConfig"
                            @ready="onEditorReady"
                        ></ckeditor>
                    </div>
                </div>
                <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <FormButton
                        buttonStyle="primary"
                        class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                        @click="save"
                        :disabled="isLoading"
                    >
                        <Icon v-if="isLoading" name="eos-icons:loading" class="mr-2" />
                        {{ $t("save") }}
                    </FormButton>
                    <FormButton
                        buttonStyle="danger"
                        class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-red-500 text-base font-medium hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        @click="close"
                    >
                        {{ $t("cancel") }}
                    </FormButton>
                </div>
            </div>
        </div>
    </div>
</template>
 
<script setup lang="ts">
import {
    DecoupledEditor,
    Bold,
    Italic,
    Underline,
    Paragraph,
    Undo,
    Font,
    Alignment,
    Essentials,
    GeneralHtmlSupport,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";
import { useI18n } from "vue-i18n";
 
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
 
const emit = defineEmits(["close", "save"]);
const { t } = useI18n();
 
const editor = DecoupledEditor;
const editorData = ref(props.initialData);
const documentName = ref(props.initialName);
const isLoading = ref(false);
const editorInstance = ref(null);
 
const onEditorReady = (editor: any) => {
    editorInstance.value = editor;
 
    const toolbarContainer = document.querySelector("#toolbar-container");
    if (toolbarContainer && editor.ui.view.toolbar.element) {
        toolbarContainer.appendChild(editor.ui.view.toolbar.element);
    }
};
 
const editorConfig = ref({
    plugins: [
        Essentials,
        Bold,
        Italic,
        Underline,
        Paragraph,
        Undo,
        Font,
        Alignment,
        GeneralHtmlSupport,
    ],
    htmlSupport: {
        allow: [
            {
                name: /.*/,
                attributes: true,
                classes: true,
                styles: true,
            },
        ],
    },
    toolbar: {
        items: [
            "fontFamily",
            "fontSize",
            "|",
            "alignment",
            "|",
            "bold",
            "italic",
            "underline",
            "undo",
            "redo",
        ],
        shouldNotGroupWhenFull: true,
    },
    fontFamily: {
        options: [
            "default",
            { title: "Arial", model: "'Arial'" },
            { title: "Courier New", model: "'Courier New'" },
            { title: "Georgia", model: "'Georgia'" },
            { title: "Lucida Sans Unicode", model: "'Lucida Sans Unicode'" },
            { title: "Tahoma", model: "'Tahoma'" },
            { title: "Times New Roman", model: "'Times New Roman'" },
            { title: "Trebuchet MS", model: "'Trebuchet MS'" },
            { title: "Verdana", model: "'Verdana'" },
            { title: "Comic Sans MS", model: "'Comic Sans MS'" },
            { title: "Impact", model: "'Impact'" },
        ],
        supportAllValues: true,
    },
    fontSize: {
        options: [
            "default",
            "8pt",
            "9pt",
            "10pt",
            "11pt",
            "12pt",
            "14pt",
            "16pt",
            "18pt",
            "20pt",
            "22pt",
            "24pt",
            "26pt",
            "28pt",
            "36pt",
            "48pt",
            "72pt",
        ],
        supportAllValues: true,
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
 
    console.log(
        "💾 Saving document content:",
        editorData.value?.substring(0, 500),
    );
    console.log("💾 Full HTML length:", editorData.value?.length);
 
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
