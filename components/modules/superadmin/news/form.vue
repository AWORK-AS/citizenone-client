<template>
    <form @submit.prevent="submitForm()" class="mt-6 max-w-2xl">
        <Alert type="danger" :text="props?.error?.message"
            v-if="props.error?.message && props.error.message.length > 0" />
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <div class="grid grid-cols-1 gap-y-3">
            <div class="space-y-1">
                <div class="flex flex-col items-center">
                    <input type="file" ref="image" @change="onFileChange" class="hidden" />
                    <div class="relative cursor-pointer" @click="triggerFileInput">
                        <img :src="avatarUrl" alt="Avatar"
                            class="w-44 h-44 rounded-md object-cover border-2 border-tertiary-25" />
                        <div
                            class="rounded-md absolute inset-0 bg-black bg-opacity-50 text-white opacity-0 hover:opacity-100 transition-opacity">
                            <div class="flex items-center w-full h-full justify-center text-xs">
                                Change Image
                            </div>
                        </div>
                    </div>
                </div>
                <FormError :error="props?.error?.errors?.image?.[0]" class="text-center" />
            </div>
            <div class="space-y-1">
                <FormLabel for="title" :label="$t('superadmin.news.form.title')" />
                <FormTextField id="title" name="title" :placeholder="$t('superadmin.news.form.title')"
                    v-model="state.formNews.title" />
                <FormError :error="v$?.formNews?.title?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.title?.[0]" />
            </div>
            <div class="space-y-1">
                <FormLabel for="content" :label="$t('superadmin.news.form.content')" />
                <FormTextArea id="content" name="content" :placeholder="$t('superadmin.news.form.content')"
                    v-model="state.formNews.content" />
                <FormError :error="v$?.formNews?.content?.$errors[0]?.$message.toString()" />
                <FormError :error="props?.error?.errors?.content?.[0]" />
            </div>
            <div class="space-y-1">
                <div class="w-fit flex items-center cursor-pointer" @click="changeIsActive">
                    <FormCheckbox :value="state.formNews.is_active" />
                    {{ $t('superadmin.news.form.active') }}
                </div>
            </div>
        </div>
        <div class="mt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                    @click="navigateTo('/superadmin/news')">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton type="submit" buttonStyle="primary" class="rounded-md">
                    {{ props.formType === 'create' ? $t('save') :
                        $t('update') }}
                </FormButton>
            </div>
        </div>
    </form>
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import type { NewsForm, Error } from '@/types'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    formType: {
        type: String,
        required: true,
    },
    selectedNews: {
        type: Object,
        required: false,
    },
})
const emit = defineEmits(['isPageLoading', 'submitForm'])

const { t } = useI18n()
const image = ref<HTMLInputElement | null>(null)
const avatarUrl = ref(`https://via.placeholder.com/1024x1024.png?text=Upload+Image`)

const state = reactive({
    error: {} as Error,
    formNews: {
        image: '',
        title: '',
        content: '',
        is_active: true,
    } as NewsForm,
})

watch(() => props.selectedNews, (newValue: any) => {
    if (newValue != null) {
        state.formNews = {
            image: newValue.image,
            title: newValue.title,
            content: newValue.content,
            is_active: newValue.is_active,
        }
    }
})

const rules = computed(() => {
    return {
        formNews: {
            title: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
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
        emit('submitForm', state.formNews)
    }
}

function triggerFileInput() {
    if (image.value) {
        image.value.click()
    }
}

function onFileChange(event: any) {
    const file = event.target.files[0]
    state.formNews.image = event.target.files[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = (e: any) => {
            avatarUrl.value = e.target.result
        }
        reader.readAsDataURL(file)
    }
}

function changeIsActive() {
    state.formNews.is_active = !state.formNews.is_active
}
</script>