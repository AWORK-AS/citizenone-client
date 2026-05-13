<template>
    <form @submit.prevent="submitForm()">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <LoadingSpinner :isActive="state.isPageLoading">
            <div class="space-y-3">
                <div class="space-y-1">
                    <FormLabel for="name" :label="$t('mail.settings.signatures.form.name')" />
                    <FormTextField id="name" name="name" :placeholder="$t('mail.settings.signatures.form.name')"
                        v-model="state.formSignature.name" />
                    <FormError :error="v$?.formSignature?.name?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.name?.[0]" />
                </div>
                <div class="space-y-1">
                    <p class="text-sm text-gray-600">
                        {{ $t('mail.settings.signatures.form.signature') }}
                    </p>
                    <ckeditor :editor="editor" v-model="state.formSignature.signature" :config="editorSignatureConfig">
                    </ckeditor>
                    <FormError :error="v$?.formSignature?.signature?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.signature?.[0]" />
                </div>
                <div class="space-y-1">
                    <div class="w-fit flex items-center cursor-pointer"
                        @click="state.formSignature.is_default = !state.formSignature.is_default">
                        <FormCheckbox id="is_default" :value="state.formSignature.is_default" />
                        {{ $t('mail.settings.signatures.form.default') }}
                    </div>
                </div>
            </div>
            <div class="mt-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormButton type="button" buttonStyle="cancel" @click="emit('closeModal')">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton type="submit" buttonStyle="primary" class="w-full">
                        {{ props.formType === 'create' ? $t('save') :
                            $t('update') }}
                    </FormButton>
                </div>
            </div>
        </LoadingSpinner>
    </form>
</template>

<script setup lang="ts">
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedSignature: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['closeModal', 'submitForm'])
const { t } = useI18n()
const editor = ref(ClassicEditor)
const editorSignatureConfig = ref({
    // Add your custom configuration here
    toolbar: ['undo', 'redo', 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote'],
    heading: {
        options: [
            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
            { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
            { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
            { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
            { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
            { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
            { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' },
        ]
    },
    // extraPlugins: [SignatureUploadAdapterPlugin],
    height: 500  // Set the editor height here
}) as any

const state = reactive({
    error: {} as Error,
    formSignature: {
        name: '',
        signature: '',
        is_default: false,
    },
    isPageLoading: false,
})

onMounted(() => {
    state.formSignature = {
        name: props.selectedSignature?.name,
        signature: props.selectedSignature?.signature,
        is_default: props.selectedSignature?.is_default,
    }
})

watch(() => props.selectedSignature, (newValue: any) => {
    if (newValue != null) {
        state.formSignature = {
            name: props.selectedSignature?.name,
            signature: props.selectedSignature?.signature,
            is_default: props.selectedSignature?.is_default,
        }
    }
})

const rules = computed(() => {
    return {
        formSignature: {
            name: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            signature: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        emit('submitForm', state.formSignature)
    }
}
</script>