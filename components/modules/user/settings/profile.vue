<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <form @submit.prevent="submitForm()" class="mt-8 max-w-3xl" id="formProfile">
            <Alert type="danger" :text="state?.error?.message"
                v-if="state.error?.message && state.error.message.length > 0" />
            <div class="grid grid-cols-1 md:grid-cols-8 gap-3">
                <div class="md:col-span-2">
                    <div class="space-y-1">
                        <div class="flex flex-col items-center">
                            <input type="file" ref="image" @change="onFileChange" class="hidden" />
                            <div class="relative cursor-pointer" @click="triggerFileInput">
                                <img :src="avatarUrl" alt="Avatar"
                                    class="w-36 h-36 rounded-full object-cover border-2 border-tertiary-25" />
                                <div
                                    class="rounded-full absolute inset-0 bg-black bg-opacity-50 text-white opacity-0 hover:opacity-100 transition-opacity">
                                    <div class="flex items-center w-full h-full justify-center text-xs">
                                        {{ $t('changeImage') }}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <FormError :error="state?.error?.errors?.image?.[0]" class="text-center" />
                    </div>
                </div>
                <div class="md:col-span-6 grid md:grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <FormLabel for="firstname" :label="$t('settings.profile.form.firstname')" />
                        <FormTextField id="firstname" name="firstname"
                            :placeholder="$t('settings.profile.form.firstname')"
                            v-model="state.formProfile.firstname" />
                        <FormError :error="v$?.formProfile?.firstname?.$errors[0]?.$message.toString()" />
                        <FormError :error="state?.error?.errors?.firstname?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="lastname" :label="$t('settings.profile.form.lastname')" />
                        <FormTextField id="lastname" name="lastname" :placeholder="$t('settings.profile.form.lastname')"
                            v-model="state.formProfile.lastname" />
                        <FormError :error="v$?.formProfile?.lastname?.$errors[0]?.$message.toString()" />
                        <FormError :error="state?.error?.errors?.lastname?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="email" :label="$t('settings.profile.form.emailAddress')" />
                        <FormTextField id="email" name="email" :placeholder="$t('settings.profile.form.emailAddress')"
                            v-model="state.formProfile.email" />
                        <FormError :error="v$?.formProfile?.email?.$errors[0]?.$message.toString()" />
                        <FormError :error="state?.error?.errors?.email?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="phone" :label="$t('settings.profile.form.phone')" />
                        <FormTextField id="phone" name="phone" :placeholder="$t('settings.profile.form.phone')"
                            v-model="state.formProfile.phone" />
                        <FormError :error="v$?.formProfile?.phone?.$errors[0]?.$message.toString()" />
                        <FormError :error="state?.error?.errors?.phone?.[0]" />
                    </div>
                </div>
                <div class="md:col-span-8 grid md:grid-cols-2 gap-3">
                    <div class="space-y-1">
                        <FormLabel for="birthday" :label="$t('settings.profile.form.birthday')" />
                        <FormDateField id="birthday" name="birthday" :placeholder="$t('settings.profile.form.birthday')"
                            v-model="state.formProfile.birthday" />
                        <FormError :error="v$?.formProfile?.birthday?.$errors[0]?.$message.toString()" />
                        <FormError :error="state?.error?.errors?.birthday?.[0]" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="language" :label="$t('settings.profile.form.language')" />
                        <FormSelect id="language" :options="state.options.languages"
                            v-model="state.formProfile.language_uuid" />
                        <FormError :error="v$?.formProfile?.language_uuid?.$errors[0]?.$message.toString()" />
                        <FormError :error="state?.error?.errors?.language_uuid?.[0]" />
                    </div>
                </div>
                <div class="md:col-span-8 grid md:grid-cols-1"
                    v-if="userStore.getUser?.roles?.some((role: any) => role.name === 'Admin')">
                    <div class="space-y-1">
                        <FormLabel for="pages" :label="$t('settings.profile.form.pageAccess')" />
                        <FormSelectMultiple id="pages" :options="state.options.pages"
                            v-model="state.formProfile.pages" />
                        <FormError :error="v$?.formProfile?.pages?.$errors[0]?.$message.toString()" />
                        <FormError :error="state?.error?.errors?.page_uuid?.[0]" />
                    </div>
                </div>
                <div class="md:col-span-8 grid md:grid-cols-1"
                    v-if="userStore.getUser?.company?.change_password_enabled">
                    <div class="space-y-1">
                        <div class="w-fit flex items-center cursor-pointer"
                            @click="state.isChangePassword = !state.isChangePassword">
                            <FormCheckbox id="change_password" :value="state.isChangePassword" />
                            {{ $t('settings.profile.form.changePassword') }}
                        </div>
                    </div>
                    <div class="space-y-1" v-if="state.isChangePassword">
                        <FormLabel for="password" :label="$t('settings.profile.form.password')" />
                        <FormPasswordField id="password" name="password"
                            :placeholder="$t('settings.profile.form.password')" v-model="state.formProfile.password" />
                        <FormError :error="v$?.formProfile?.password?.$errors[0]?.$message.toString()" />
                        <FormError :error="state?.error?.errors?.password?.[0]" />
                    </div>
                </div>
            </div>
            <div class="mt-6">
                <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full">
                    {{ $t('save') }}
                </FormButton>
            </div>
        </form>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { languageService } from '@/components/api/user/LanguageService'
import { pageService } from '@/components/api/user/PageService'
import { userService } from "@/components/api/user/UserService"
import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const userStore = useUserStore() as any
const language = useI18n()
const { successAlert } = useAlert()
const { t } = useI18n()
const image = ref<HTMLInputElement | null>(null)
const avatarUrl = ref('/img/avatars/user.svg')


const state = reactive({
    error: {} as Error,
    formProfile: {
        image: '',
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        birthday: '',
        language_uuid: '',
        pages: [] as any,
        password: '',
    },
    isChangePassword: false,
    isPageLoading: false,
    options: {
        languages: [],
        pages: [],
    },
})

const rulesFormProfile = computed(() => {
    if (state.isChangePassword) {
        return {
            formProfile: {
                firstname: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                lastname: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                email: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                phone: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                birthday: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                language_uuid: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                password: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
            },
        }
    } else {
        return {
            formProfile: {
                firstname: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                lastname: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                email: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                phone: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                birthday: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
                language_uuid: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                },
            },
        }
    }
})

onMounted(() => {
    fetchLanguages()
    fetchPages()
})

watch(() => userStore.getUser, (newValue: any) => {
    if (newValue != null) {
        if (newValue.profile_image) {
            avatarUrl.value = newValue.profile_image
        }
        state.formProfile = {
            image: '',
            firstname: newValue?.firstname,
            lastname: newValue?.lastname,
            email: newValue?.email,
            phone: newValue?.phone,
            birthday: newValue?.birthday,
            language_uuid: newValue?.language?.uuid,
            pages: [],
            password: '',
        }
        newValue?.pages.forEach((page: any) => {
            state.formProfile.pages.push(page?.uuid)
        })
    }
})

async function fetchLanguages() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await languageService.getAllLanguages()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.name,
                })
            )
            state.options.languages = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchPages() {
    state.isPageLoading = true
    state.error = {}
    try {
        const response = await pageService.getAllPages()
        if (response) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.name,
                })
            )
            state.options.pages = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

const v$ = useVuelidate(rulesFormProfile, state)

async function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        state.error = {}
        state.isPageLoading = true
        try {
            let params = new FormData()
            params.append('profile_image', state.formProfile.image)
            params.append('firstname', state.formProfile.firstname)
            params.append('lastname', state.formProfile.lastname)
            params.append('email', state.formProfile.email)
            params.append('phone', state.formProfile.phone)
            params.append('birthday', state.formProfile.birthday)
            params.append('language_uuid', state.formProfile.language_uuid)
            if (state.formProfile.pages) {
                params.append('page_uuid', JSON.stringify(state.formProfile.pages))
            }
            if (state.formProfile.password) {
                params.append('password', state.formProfile.password)
            }
            const response = await userService.updateUser(params)
            if (response.data) {
                userStore.setLanguage(response?.data?.language?.code)
                userStore.setUser(response?.data)
                language.locale.value = response?.data?.language?.code
                state.isChangePassword = false
                successAlert(`${t('alert.success')}!`, `${t('settings.profile.form.alert.successfullyUpdated')}.`)
            }
        } catch (error: any) {
            state.error = error
        }
        state.isPageLoading = false
    }
}

function triggerFileInput() {
    if (image.value) {
        image.value.click()
    }
}

function onFileChange(event: any) {
    const file = event.target.files[0]
    state.formProfile.image = event.target.files[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = (e: any) => {
            avatarUrl.value = e.target.result
        }
        reader.readAsDataURL(file)
    }
}
</script>

<style>
#formProfile .multiselect-dropdown {
    max-height: 4.8rem !important;
}
</style>