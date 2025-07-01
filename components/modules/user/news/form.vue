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
                <div v-if="userStore.getUser?.has_citizen_app" class="space-y-1">
                    <FormLabel for="audience" :label="$t('news.form.audience')" />
                    <FormSelectMultiple id="audience" :options="state.options.audiences"
                        v-model="state.formNews.audience" />
                    <FormError :error="v$?.formNews?.audience?.$errors[0]?.$message.toString()" />
                    <FormError :error="props?.error?.errors?.audience_uuid?.[0]" />
                </div>
                <div v-if="userStore.getUser?.has_citizen_app" class="space-y-1">
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
                        {{ props.formType === 'create' ? $t('save') :
                            $t('update') }}
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
const avatarUrl = ref(`/img/icons/asset-02.svg`)

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
    } as NewsForm,
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
            audience: newValue.audience,
            department: newValue.department,
        }
        if (newValue.image) {
            avatarUrl.value = newValue.image
        }
    }
})

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
        const response = await departmentService.getAllDepartments()
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

function changeIsFeatured() {
    state.formNews.is_featured = !state.formNews.is_featured
}

function changeIsActive() {
    state.formNews.is_active = !state.formNews.is_active
}
</script>