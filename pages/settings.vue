<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('settings.settings') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('settings.settings') }}</template>

            <LoadingSpinner :isActive="state.isPageLoading">
                <form @submit.prevent="submitForm()" class="mt-6 max-w-3xl">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error && state.error.length > 0 || state.error?.message" />
                    <div class="grid grid-cols-8 gap-3">
                        <div class="col-span-2">
                            <div class="space-y-1">
                                <div class="flex flex-col items-center">
                                    <input type="file" ref="image" @change="onFileChange" class="hidden" />
                                    <div class="relative cursor-pointer" @click="triggerFileInput">
                                        <img :src="avatarUrl" alt="Avatar"
                                            class="w-36 h-36 rounded-full object-cover border-2 border-tertiary-25" />
                                        <div
                                            class="rounded-full absolute inset-0 bg-black bg-opacity-50 text-white opacity-0 hover:opacity-100 transition-opacity">
                                            <div class="flex items-center w-full h-full justify-center text-xs">
                                                Change Image
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <FormError :error="state?.error?.errors?.image?.[0]" class="text-center" />
                            </div>
                        </div>
                        <div class="col-span-6 grid grid-cols-2 gap-3">
                            <div class="">
                                <div class="space-y-1">
                                    <FormLabel for="firstname" :label="$t('settings.form.firstname')" />
                                    <FormTextField id="firstname" name="firstname"
                                        :placeholder="$t('settings.form.firstname')"
                                        v-model="state.formProfile.firstname" />
                                    <FormError :error="v$?.formProfile?.firstname?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.firstname?.[0]" />
                                </div>
                            </div>
                            <div class="">
                                <div class="space-y-1">
                                    <FormLabel for="lastname" :label="$t('settings.form.lastname')" />
                                    <FormTextField id="lastname" name="lastname"
                                        :placeholder="$t('settings.form.lastname')"
                                        v-model="state.formProfile.lastname" />
                                    <FormError :error="v$?.formProfile?.lastname?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.lastname?.[0]" />
                                </div>
                            </div>
                            <div>
                                <div class="space-y-1">
                                    <FormLabel for="email" :label="$t('settings.form.emailAddress')" />
                                    <FormTextField id="email" name="email"
                                        :placeholder="$t('settings.form.emailAddress')"
                                        v-model="state.formProfile.email" />
                                    <FormError :error="v$?.formProfile?.email?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.email?.[0]" />
                                </div>
                            </div>
                            <div>
                                <div class="space-y-1">
                                    <FormLabel for="phone" :label="$t('settings.form.phone')" />
                                    <FormTextField id="phone" name="phone" :placeholder="$t('settings.form.phone')"
                                        v-model="state.formProfile.phone" />
                                    <FormError :error="v$?.formProfile?.phone?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.phone?.[0]" />
                                </div>
                            </div>
                        </div>
                        <div class="col-span-8 grid grid-cols-2 gap-3">
                            <div>
                                <div class="space-y-1">
                                    <FormLabel for="birthday" :label="$t('settings.form.birthday')" />
                                    <FormDateField id="birthday" name="birthday"
                                        :placeholder="$t('settings.form.birthday')"
                                        v-model="state.formProfile.birthday" />
                                    <FormError :error="v$?.formProfile?.birthday?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.birthday?.[0]" />
                                </div>
                            </div>
                            <div>
                                <div class="space-y-1">
                                    <FormLabel for="phone" :label="$t('settings.form.language')" />
                                    <FormSelect id="language" :options="state.options.languages"
                                        v-model="state.formProfile.language_id" />
                                    <FormError :error="v$?.formProfile?.language?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.language_id?.[0]" />
                                </div>
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
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { languageService } from '@/components/api/LanguageService'
import { userService } from "@/components/api/UserService";
import { useI18n } from "vue-i18n"
import { notify } from "@kyvg/vue3-notification"

const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()
const image = ref(null)
const avatarUrl = ref('/img/avatars/user.svg')

const state = reactive({
    error: [],
    formProfile: {
        image: '',
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        birthday: '',
        language_id: '',
    },
    isPageLoading: false,
    options: {
        languages: [],
    }
})

const rules = computed(() => {
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
            language_id: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

onMounted(() => {
    fetchUser()
    fetchLanguages()
})

async function fetchUser() {
    state.isPageLoading = true
    try {
        const response = await userService.getUser()
        if (response.data) {
            if (response.data.profile_image) {
                avatarUrl.value = response.data.profile_image
            }
            state.formProfile = {
                image: '',
                firstname: response.data?.firstname,
                lastname: response.data?.lastname,
                email: response.data?.email,
                phone: response.data?.phone,
                birthday: response.data?.birthday,
                language_id: response.data?.language_id,
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchLanguages() {
    state.isPageLoading = true
    try {
        const response = await languageService.getLanguages()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.id,
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

const v$ = useVuelidate(rules, state)

async function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        state.error = []
        state.isPageLoading = true
        try {
            let params = new FormData()
            params.append('profile_image', state.formProfile.image)
            params.append('firstname', state.formProfile.firstname)
            params.append('lastname', state.formProfile.lastname)
            params.append('email', state.formProfile.email)
            params.append('phone', state.formProfile.phone)
            params.append('birthday', state.formProfile.birthday)
            params.append('language_id', state.formProfile.language_id)
            const response = await userService.updateUser(params)
            if (response.data) {
                successAlert(`${t('alert.success')}!`, `${t('settings.form.alert.successfullyUpdated')}.`)
            }
        } catch (error: any) {
            state.error = error
        }
        state.isPageLoading = false
    }
}

function triggerFileInput() {
    image.value.click()
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

function successAlert(title: string, message: string) {
    notify({
        title: title,
        text: message,
        type: 'success',
    })
}
</script>