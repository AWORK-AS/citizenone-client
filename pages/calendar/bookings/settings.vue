<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>
                    {{ $t('bookingSettings.bookingSettings') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('bookingSettings.bookingSettings') }}</template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/calendar/bookings">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>

            <LoadingSpinner :isActive="state.isPageLoading">
                <form @submit.prevent="submitForm()" class="mt-8 max-w-3xl" id="formBookingSettings">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <div class="mt-3 space-y-3 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-6 sm:p-8">
                        <div>
                            <h2 class="text-base font-semibold leading-7 text-gray-900">
                                {{ $t('bookingSettings.form.information') }}
                            </h2>
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="header" :label="$t('bookingSettings.form.header')" />
                            <FormTextField id="header" name="header"
                                :placeholder="$t('bookingSettings.form.headerLabel')"
                                v-model="state.formBookingSettings.header" />
                            <FormError :error="v$?.formBookingSettings?.header?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.header?.[0]" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="link" :label="$t('bookingSettings.form.onlineBookingLink')" />
                            <div class="flex items-start">
                                <div class="pl-3 pr-5 bg-gray-100 py-2.5 rounded-tl-md rounded-bl-md">
                                    {{ runtimeConfig.public.appBaseURL }}/book/
                                </div>
                                <div class="grow">
                                    <FormTextField id="link" name="link" class="rounded-tl-none rounded-bl-none"
                                        :placeholder="$t('bookingSettings.form.onlineBookingLinkLabel')"
                                        v-model="state.formBookingSettings.link" />
                                    <FormError
                                        :error="v$?.formBookingSettings?.link?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.link?.[0]" />
                                </div>
                            </div>
                        </div>
                        <div class="space-y-1">
                            <p class="text-sm text-gray-600">
                                {{ $t('bookingSettings.form.description') }}
                            </p>
                            <ckeditor :editor="editor" v-model="state.formBookingSettings.description"
                                :config="editorDescriptionConfig">
                            </ckeditor>
                            <FormError :error="v$?.formBookingSettings?.description?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.description?.[0]" />
                        </div>
                        <div class="space-y-1">
                            <p class="text-sm text-gray-600">
                                {{ $t('bookingSettings.form.image') }}
                            </p>
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
                            <FormError :error="v$?.formBookingSettings?.image?.$errors[0]?.$message.toString()"
                                class="text-center" />
                            <FormError :error="state?.error?.errors?.image?.[0]" class="text-center" />
                        </div>
                        <div class="space-y-1">
                            <div>
                                <h2 class="text-base font-semibold leading-7 text-gray-900">
                                    {{ $t('bookingSettings.form.contactInformation') }}
                                </h2>
                                <p class="text-sm leading-6 text-gray-600">
                                    {{ $t('bookingSettings.form.contactInformationLabel') }}
                                </p>
                            </div>
                            <div class="grid grid-cols-2 gap-3">
                                <div class="flex items-center gap-x-2">
                                    <FormSwitch :value="state.formBookingSettings.is_address_enabled"
                                        @toggleSwitch="state.formBookingSettings.is_address_enabled = !state.formBookingSettings.is_address_enabled" />
                                    <p>
                                        {{ $t('bookingSettings.form.address') }}
                                    </p>
                                </div>
                                <div class="flex items-center gap-x-2">
                                    <FormSwitch :value="state.formBookingSettings.is_phone_enabled"
                                        @toggleSwitch="state.formBookingSettings.is_phone_enabled = !state.formBookingSettings.is_phone_enabled" />
                                    <p>
                                        {{ $t('bookingSettings.form.phone') }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="mt-5 space-y-3 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-6 sm:p-8">
                        <div>
                            <h2 class="text-base font-semibold leading-7 text-gray-900">
                                {{ $t('bookingSettings.form.language') }}
                            </h2>
                            <p class="text-sm leading-6 text-gray-600">
                                {{ $t('bookingSettings.form.languageLabel') }}
                            </p>
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="language" :label="$t('bookingSettings.form.language')" />
                            <FormSelect id="language" :options="state.options.languages"
                                v-model="state.formBookingSettings.language_uuid" />
                            <FormError
                                :error="v$?.formBookingSettings?.language_uuid?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.language_uuid?.[0]" />
                        </div>
                    </div>

                    <div class="mt-5 space-y-3 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-6 sm:p-8">
                        <div>
                            <h2 class="text-base font-semibold leading-7 text-gray-900">
                                {{ $t('bookingSettings.form.fields.fields') }}
                            </h2>
                            <p class="text-sm leading-6 text-gray-600">
                                {{ $t('bookingSettings.form.fields.fieldsLabel') }}
                            </p>
                        </div>

                        <div class="grid grid-cols-2 md:grid-cols-4 gap-x-3 gap-y-4">
                            <div class="flex items-center gap-x-2">
                                <FormSwitch :value="!!state.formBookingSettings.fields?.email"
                                    @toggleSwitch="toggleField('email')" />
                                <p>
                                    {{ $t('bookingSettings.form.fields.email') }}
                                </p>
                            </div>
                            <div class="md:col-span-3">
                                <div class="flex items-center gap-x-2" v-if="state.formBookingSettings.fields?.email">
                                    <FormSwitch :value="!!state.formBookingSettings.fields?.email?.required"
                                        @toggleSwitch="toggleFieldRequired('email')" />
                                    <p>
                                        {{ $t('bookingSettings.form.fields.required') }}
                                    </p>
                                </div>
                            </div>
                            <div class="flex items-center gap-x-2">
                                <FormSwitch :value="!!state.formBookingSettings.fields?.phone"
                                    @toggleSwitch="toggleField('phone')" />
                                <p>
                                    {{ $t('bookingSettings.form.fields.phone') }}
                                </p>
                            </div>
                            <div class="md:col-span-3">
                                <div class="flex items-center gap-x-2" v-if="state.formBookingSettings.fields?.phone">
                                    <FormSwitch :value="!!state.formBookingSettings.fields?.phone?.required"
                                        @toggleSwitch="toggleFieldRequired('phone')" />
                                    <p>
                                        {{ $t('bookingSettings.form.fields.required') }}
                                    </p>
                                </div>
                            </div>
                            <div class="flex items-center gap-x-2">
                                <FormSwitch :value="!!state.formBookingSettings.fields?.address"
                                    @toggleSwitch="toggleField('address')" />
                                <p>
                                    {{ $t('bookingSettings.form.fields.address') }}
                                </p>
                            </div>
                            <div class="md:col-span-3">
                                <div class="flex items-center gap-x-2" v-if="state.formBookingSettings.fields?.address">
                                    <FormSwitch :value="!!state.formBookingSettings.fields?.address?.required"
                                        @toggleSwitch="toggleFieldRequired('address')" />
                                    <p>
                                        {{ $t('bookingSettings.form.fields.required') }}
                                    </p>
                                </div>
                            </div>
                            <div class="flex items-center gap-x-2">
                                <FormSwitch :value="!!state.formBookingSettings.fields?.notes"
                                    @toggleSwitch="toggleField('notes')" />
                                <p>
                                    {{ $t('bookingSettings.form.fields.notes') }}
                                </p>
                            </div>
                            <div class="md:col-span-3">
                                <div class="flex items-center gap-x-2" v-if="state.formBookingSettings.fields?.notes">
                                    <FormSwitch :value="!!state.formBookingSettings.fields?.notes?.required"
                                        @toggleSwitch="toggleFieldRequired('notes')" />
                                    <p>
                                        {{ $t('bookingSettings.form.fields.required') }}
                                    </p>
                                </div>
                            </div>
                            <div class="flex items-center gap-x-2">
                                <FormSwitch :value="!!state.formBookingSettings.fields?.social_security_number"
                                    @toggleSwitch="toggleField('social_security_number')" />
                                <p>
                                    {{ $t('bookingSettings.form.fields.socialSecurityNumber') }}
                                </p>
                            </div>
                            <div class="md:col-span-3 flex items-center">
                                <div class="flex items-center gap-x-2"
                                    v-if="state.formBookingSettings.fields?.social_security_number">
                                    <FormSwitch
                                        :value="!!state.formBookingSettings.fields?.social_security_number?.required"
                                        @toggleSwitch="toggleFieldRequired('social_security_number')" />
                                    <p>
                                        {{ $t('bookingSettings.form.fields.required') }}
                                    </p>
                                </div>
                            </div>
                            <div class="flex items-center gap-x-2">
                                <FormSwitch :value="!!state.formBookingSettings.fields?.date_of_birth"
                                    @toggleSwitch="toggleField('date_of_birth')" />
                                <p>
                                    {{ $t('bookingSettings.form.fields.dateOfBirth') }}
                                </p>
                            </div>
                            <div class="md:col-span-3">
                                <div class="flex items-center gap-x-2"
                                    v-if="state.formBookingSettings.fields?.date_of_birth">
                                    <FormSwitch :value="!!state.formBookingSettings.fields?.date_of_birth?.required"
                                        @toggleSwitch="toggleFieldRequired('date_of_birth')" />
                                    <p>
                                        {{ $t('bookingSettings.form.fields.required') }}
                                    </p>
                                </div>
                            </div>
                            <div class="md:col-span-4 flex items-center gap-x-2">
                                <FormSwitch :value="!!state.formBookingSettings.fields?.conditions"
                                    @toggleSwitch="toggleField('conditions')" />
                                <p>
                                    {{ $t('bookingSettings.form.fields.conditions') }}
                                </p>
                            </div>
                            <div class="md:col-span-4">
                                <div v-if="state.formBookingSettings.fields?.conditions">
                                    <p class="text-xs text-gray-600 mb-1">
                                        {{ $t('bookingSettings.form.fields.conditionsLabel') }}.
                                    </p>
                                    <FormTextField id="conditions" name="conditions"
                                        :placeholder="$t('bookingSettings.form.fields.conditions')"
                                        v-model="state.formBookingSettings.fields.conditions.value" />
                                    <FormError
                                        :error="v$?.formBookingSettings?.fields?.conditions?.value?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.fields?.[0]" />
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
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { languageService } from '@/components/api/user/LanguageService'
import { onlineBookingSettingsService } from '@/components/api/user/OnlineBookingSettingsService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const editor = ref(ClassicEditor)
const editorDescriptionConfig = ref({
    // Add your custom configuration here
    toolbar: ['undo', 'redo', 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'imageUpload'],
    heading: {
        options: [
            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
            { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
            { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
            { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' }
        ]
    },
    // extraPlugins: [DescriptionUploadAdapterPlugin],
    height: 500  // Set the editor height here
}) as any
const image = ref<HTMLInputElement | null>(null)
const avatarUrl = ref(`/img/icons/asset-02.svg`)

const breadcrumbLinks = [
    {
        name: 'bookingSettings.bookingSettings',
        translate: true,
        href: '/calendar/bookings/settings',
    },
]

const state = reactive({
    bookings: [],
    error: {} as Error,
    formBookingSettings: {
        header: '',
        link: '',
        description: '',
        image: '',
        is_address_enabled: false,
        is_phone_enabled: false,
        language_uuid: '',
        fields: [] as any,
        has_calendar: false,
        is_booking_limit: false,
        enable_odd_even_times: false,
        is_private_calendar: false,
    } as any,
    isPageLoading: false,
    modal: {},
    options: {
        languages: [],
    },
})

const rules = computed(() => {
    const form = state.formBookingSettings
    const hasConditions = form.fields?.conditions && form.fields.conditions.enabled

    const baseRules: any = {
        formBookingSettings: {
            header: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            link: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            language_uuid: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        }
    }

    if (hasConditions) {
        baseRules.formBookingSettings.fields = {
            conditions: {
                value: {
                    required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
                }
            }
        }
    }

    return baseRules
})


const v$ = useVuelidate(rules, state)

onMounted(() => {
    fetchLanguages()
    fetchBookingSettings()
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

async function fetchBookingSettings() {
    state.error = {}
    try {
        const response = await onlineBookingSettingsService.getOnlineBookingSettings()
        if (response?.data) {
            state.formBookingSettings = {
                header: response.data?.header,
                link: response.data?.link,
                description: response.data?.description,
                image: '',
                is_address_enabled: response.data?.is_address_enabled ?? false,
                is_phone_enabled: response.data?.is_phone_enabled ?? false,
                language_uuid: response.data?.language?.uuid,
                fields: response.data?.fields ? JSON.parse(response.data?.fields) : [],
                has_calendar: response.data?.has_calendar ?? false,
                is_booking_limit: response.data?.is_booking_limit ?? false,
                enable_odd_even_times: response.data?.enable_odd_even_times ?? false,
                is_private_calendar: response.data?.is_private_calendar ?? false,
            }
            if (response.data?.image_url) {
                avatarUrl.value = response.data?.image_url
            }
        }
    } catch (error: any) {
        state.error = error
    }
}

function triggerFileInput() {
    if (image.value) {
        image.value.click()
    }
}

function onFileChange(event: any) {
    const file = event.target.files[0]
    state.formBookingSettings.image = event.target.files[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = (e: any) => {
            avatarUrl.value = e.target.result
        }
        reader.readAsDataURL(file)
    }
}

function toggleField(field: string) {
    const fields = { ...state.formBookingSettings.fields } // Create a shallow copy of fields

    if (fields[field]) {
        // If the field already exists, delete it
        delete fields[field]
    } else {
        // If the field does not exist, add it with a default value
        fields[field] = field === 'conditions'
            ? { enabled: true, value: '' }
            : { enabled: true, required: false }
    }

    state.formBookingSettings.fields = fields // Update the state with the modified fields object
}

function toggleFieldRequired(field: string) {
    const fields = { ...state.formBookingSettings.fields } // Create a shallow copy of fields

    if (!fields[field]) {
        fields[field] = { enabled: true, required: true } // Initialize with required if not already present
    } else {
        fields[field].required = !fields[field].required // Toggle the required flag
    }

    state.formBookingSettings.fields = fields // Update the state with the modified fields object
}


async function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        state.error = {}
        state.isPageLoading = true
        try {
            let params = new FormData()
            params.append('header', state.formBookingSettings.header)
            params.append('link', state.formBookingSettings.link)
            if (state.formBookingSettings.description) {
                params.append('description', state.formBookingSettings.description)
            }
            if (state.formBookingSettings.image) {
                params.append('image', state.formBookingSettings.image)
            }
            params.append('is_address_enabled', state.formBookingSettings.is_address_enabled)
            params.append('is_phone_enabled', state.formBookingSettings.is_phone_enabled)
            params.append('language_uuid', state.formBookingSettings.language_uuid)
            params.append('fields', JSON.stringify(state.formBookingSettings.fields))
            params.append('has_calendar', state.formBookingSettings.has_calendar)
            params.append('is_booking_limit', state.formBookingSettings.is_booking_limit)
            params.append('enable_odd_even_times', state.formBookingSettings.enable_odd_even_times)
            params.append('is_private_calendar', state.formBookingSettings.is_private_calendar)
            const response = await onlineBookingSettingsService.saveOnlineBookingSettings(params)
            if (response.data) {
                fetchBookingSettings()
                successAlert(`${t('alert.success')}!`, `${t('bookingSettings.alert.bookingSettingsSuccessfullySaved')}.`)
            }
        } catch (error: any) {
            state.error = error
        }
        state.isPageLoading = false
    }
}
</script>