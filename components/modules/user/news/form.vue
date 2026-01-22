<template>
    <LoadingSpinner :isActive="state.isPageLoading">
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
                                    {{ $t('changeImage') }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <FormError :error="v$?.formNews?.image?.$errors[0]?.$message.toString()" class="text-center" />
                    <FormError :error="props?.error?.errors?.image?.[0]" class="text-center" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="title" :label="$t('news.form.title')" />
                    <FormTextField id="title" name="title" :placeholder="$t('news.form.title')"
                        v-model="state.formNews.title" />
                    <FormError :error="v$?.formNews?.title?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.title?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="link" :label="$t('news.form.link')" />
                    <FormTextField id="link" name="link" :placeholder="$t('news.form.link')"
                        v-model="state.formNews.link" />
                    <FormError :error="v$?.formNews?.link?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.link?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="content" :label="$t('news.form.content')" />
                    <FormTextArea id="content" name="content" :placeholder="$t('news.form.content')"
                        v-model="state.formNews.content" />
                    <FormError :error="v$?.formNews?.content?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.content?.[0]" />
                </div>

                <!-- File Attachment Section -->
                <div class="space-y-1">
                    <FormLabel for="attachments" :label="$t('news.form.attachments')" />
                    <input type="file" ref="attachmentInput" @change="onAttachmentChange" class="hidden" multiple />
                    <div class="border-2 border-dashed border-tertiary-25 rounded-md p-4 text-center cursor-pointer hover:border-primary transition-colors"
                        @click="triggerAttachmentInput">
                        <div class="flex flex-col items-center gap-2">
                            <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span class="text-sm text-primary">
                                {{ $t('news.form.clickToUpload') }}
                            </span>
                            <span class="text-xs text-primary">
                                {{ $t('news.form.multipleFilesAllowed') }}
                            </span>
                        </div>
                    </div>

                    <!-- Display existing attachments (for edit mode) -->
                    <div v-if="state.existingAttachments.length > 0" class="mt-3 space-y-2">
                        <p class="text-xs text-tertiary font-medium">{{ $t('news.form.existingAttachments') }}</p>
                        <div v-for="(file, index) in state.existingAttachments" :key="'existing-' + file.id"
                            class="flex items-center justify-between p-3 bg-blue-50 rounded-md border border-blue-200">
                            <div class="flex items-center gap-3 flex-1 min-w-0">
                                <!-- PDF Icon -->
                                <Icon v-if="file.mime_type === 'application/pdf'" name="ph:file-pdf"
                                    class="w-6 h-6 text-primary flex-shrink-0" />
                                <!-- Generic File Icon -->
                                <Icon v-else name="ph:file" class="w-6 h-6 text-primary flex-shrink-0" />

                                <div class="flex-1 min-w-0">
                                    <a :href="file.url" target="_blank"
                                        class="text-sm text-tertiary hover:underline font-medium truncate block">
                                        {{ file.name }}
                                    </a>
                                    <div class="flex items-center gap-2 text-xs text-tertiary-500 mt-0.5">
                                        <span>{{ formatFileSize(file.size) }}</span>
                                        <span>•</span>
                                        <span>{{ file.mime_type }}</span>
                                    </div>
                                </div>
                            </div>
                            <button type="button" @click="removeExistingAttachment(index)"
                                class="ml-3 text-red-500 hover:text-red-700 flex-shrink-0 p-1 rounded hover:bg-red-100 transition-colors"
                                :title="$t('news.form.removeFile')">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div v-if="state.formNews.attachments.length > 0" class="mt-3 space-y-2">
                        <p class="text-xs text-tertiary-600 font-medium">{{ $t('news.form.attachments') }}</p>
                        <div v-for="(file, index) in state.formNews.attachments" :key="'new-' + index"
                            class="flex items-center justify-between p-3 bg-green-50 rounded-md border border-green-200">
                            <div class="flex items-center gap-3 flex-1 min-w-0">
                                <svg class="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <div class="flex-1 min-w-0">
                                    <span class="text-sm text-green-800 font-medium truncate block">{{ file.name
                                        }}</span>
                                    <span class="text-xs text-tertiary-500 mt-0.5 block">{{ formatFileSize(file.size)
                                        }}</span>
                                </div>
                            </div>
                            <button type="button" @click="removeAttachment(index)"
                                class="ml-3 text-red-500 hover:text-red-700 flex-shrink-0 p-1 rounded hover: bg-red-100 transition-colors"
                                :title="$t('news.form.removeFile')">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <FormError :error="v$?.formNews?.attachments?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.attachments?.[0]" />
                </div>

                <div class="space-y-1">
                    <FormLabel for="audience" :label="$t('news.form.audience')" />
                    <FormSelectMultiple id="audience" :options="state.options.audiences"
                        v-model="state.formNews.audience" />
                    <FormError :error="v$?.formNews?.audience?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.audience_uuid?.[0]" />
                </div>
                <div class="space-y-1">
                    <div class="flex justify-between items-center py-0.5">
                        <FormLabel for="departments" :label="$t('news.form.department')" />
                        <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                            @click="state.modal.isAddDepartmentOpen = true">
                            {{ $t('departments.addNewDepartment') }}
                        </span>
                    </div>
                    <FormSelectMultiple id="department" :options="state.options.departments"
                        v-model="state.formNews.department" />
                    <FormError :error="v$?.formNews?.department?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.department_uuid?.[0]" />
                </div>
                <div class="space-y-1">
                    <div class="w-fit flex items-center cursor-pointer" @click="changeIsFeatured">
                        <FormCheckbox :value="state.formNews.is_featured" />
                        {{ $t('news.form.featured') }}
                    </div>
                </div>
                <div class="space-y-1">
                    <div class="w-fit flex items-center cursor-pointer" @click="changeIsActive">
                        <FormCheckbox :value="state.formNews.is_active" />
                        {{ $t('news.form.active') }}
                    </div>
                </div>
            </div>
            <div class="mt-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="navigateTo('/news')">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton type="submit" buttonStyle="primary" class="rounded-md">
                        {{ props.formType === 'create' ? $t('save') : $t('update') }}
                    </FormButton>
                </div>
            </div>
        </form>
        <ModulesUserDepartmentModalNew :isModalOpen="state.modal.isAddDepartmentOpen"
            @close="state.modal.isAddDepartmentOpen = false" @refreshDepartments="fetchAllDepartments" />
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { audienceService } from '@/components/api/user/AudienceService'
import { departmentService } from '@/components/api/user/DepartmentService'
import { useI18n } from "vue-i18n"
import type { NewsForm, Error } from '@/types'
import { useUserStore } from '@/store/user'

const userStore = useUserStore() as any
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
const attachmentInput = ref<HTMLInputElement | null>(null)
const avatarUrl = ref(`/img/icons/asset-02.svg`)

interface ExistingAttachment {
    id: number
    name: string
    file_name: string
    mime_type: string
    size: number
    url: string
}

const state = reactive({
    error: {} as Error,
    formNews: {
        image: '',
        title: '',
        link: '',
        content: '',
        is_featured: false,
        is_active: true,
        audience: [],
        department: [],
        attachments: [] as any[],
    } as NewsForm,
    existingAttachments: [] as ExistingAttachment[],
    attachmentsToDelete: [] as number[],
    isPageLoading: false,
    modal: {
        isAddDepartmentOpen: false,
    },
    options: {
        audiences: [],
        departments: [],
    }
})

watch(() => props.selectedNews, (newValue: any) => {
    if (newValue != null) {
        state.formNews = {
            image: '',
            title: newValue.title,
            link: newValue.link,
            content: newValue.content,
            is_featured: newValue.is_featured,
            is_active: newValue.is_active,
            audience: newValue.audience || newValue.audiences || [],
            department: newValue.department || newValue.departments || [],
            attachments: [],
        }
        if (newValue.image) {
            avatarUrl.value = newValue.image
        }

        // Load existing attachments from API response
        if (newValue.attachments && Array.isArray(newValue.attachments)) {
            state.existingAttachments = newValue.attachments.map((att: any) => ({
                id: att.id,
                name: att.name,
                file_name: att.file_name,
                mime_type: att.mime_type,
                size: att.size,
                url: att.url,
            }))
        } else {
            state.existingAttachments = []
        }

        // Reset attachments to delete
        state.attachmentsToDelete = []
    }
}, { immediate: true })

onMounted(() => {
    fetchAllAudiences()
    fetchAllDepartments()
})

async function fetchAllAudiences() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await audienceService.getAllAudiences()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item?.uuid,
                    label: item?.type,
                })
            )
            state.options.audiences = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchAllDepartments() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {}
        const response = await departmentService.getAllDepartments(params)
        if (response) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.name,
                })
            )
            state.options.departments = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

const rules = computed(() => {
    if (props.formType === 'create') {
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
    } else {
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
    }
})

const v$ = useVuelidate(rules, state)

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        // Include attachments to delete in the form data
        const formData = {
            ...state.formNews,
            attachmentsToDelete: state.attachmentsToDelete,
        }
        emit('submitForm', formData)
    }
}

function triggerFileInput() {
    if (image.value) {
        image.value.click()
    }
}

function triggerAttachmentInput() {
    if (attachmentInput.value) {
        attachmentInput.value.click()
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

function onAttachmentChange(event: any) {
    const files = Array.from(event.target.files) as File[]
    state.formNews.attachments = [...state.formNews.attachments, ...files]
    // Reset the input so the same file can be selected again if needed
    if (attachmentInput.value) {
        attachmentInput.value.value = ''
    }
}

function removeAttachment(index: number) {
    state.formNews.attachments.splice(index, 1)
}

function removeExistingAttachment(index: number) {
    const attachment = state.existingAttachments[index]
    if (attachment.id) {
        state.attachmentsToDelete.push(attachment.id)
    }
    state.existingAttachments.splice(index, 1)
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

function changeIsFeatured() {
    state.formNews.is_featured = !state.formNews.is_featured
}

function changeIsActive() {
    state.formNews.is_active = !state.formNews.is_active
}
</script>