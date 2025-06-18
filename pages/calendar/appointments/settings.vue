<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>
                    {{ $t('appointmentSettings.appointmentSettings') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('appointmentSettings.appointmentSettings') }}</template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/calendar/appointments">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>

            <LoadingSpinner :isActive="state.isPageLoading">
                <form @submit.prevent="submitForm()" class="mt-8 max-w-3xl" id="formAppointmentSettings">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <div class="mt-3 space-y-3 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-6 sm:p-8">
                        <div>
                            <h2 class="text-base font-semibold leading-7 text-gray-900">
                                {{ $t('appointmentSettings.form.information') }}
                            </h2>
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="header" :label="$t('appointmentSettings.form.header')" />
                            <FormTextField id="header" name="header"
                                :placeholder="$t('appointmentSettings.form.headerLabel')"
                                v-model="state.formAppointmentSettings.header" />
                            <FormError :error="v$?.formAppointmentSettings?.header?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.header?.[0]" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="link" :label="$t('appointmentSettings.form.onlineBookingLink')" />
                            <div class="flex items-start">
                                <div class="pl-3 pr-5 bg-gray-100 py-2.5 rounded-tl-md rounded-bl-md">
                                    {{ runtimeConfig.public.appBaseURL }}/book/
                                </div>
                                <div class="grow">
                                    <FormTextField id="link" name="link" class="rounded-tl-none rounded-bl-none"
                                        :placeholder="$t('appointmentSettings.form.onlineBookingLinkLabel')"
                                        v-model="state.formAppointmentSettings.link" />
                                    <FormError
                                        :error="v$?.formAppointmentSettings?.link?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.link?.[0]" />
                                </div>
                            </div>
                        </div>
                        <div class="space-y-1">
                            <p class="text-sm text-gray-600">
                                {{ $t('appointmentSettings.form.description') }}
                            </p>
                            <ckeditor :editor="editor" v-model="state.formAppointmentSettings.description"
                                :config="editorDescriptionConfig">
                            </ckeditor>
                            <FormError
                                :error="v$?.formAppointmentSettings?.description?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.description?.[0]" />
                        </div>
                        <div class="space-y-1">
                            <p class="text-sm text-gray-600">
                                {{ $t('appointmentSettings.form.image') }}
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
                            <FormError :error="v$?.formAppointmentSettings?.image?.$errors[0]?.$message.toString()"
                                class="text-center" />
                            <FormError :error="state?.error?.errors?.image?.[0]" class="text-center" />
                        </div>
                    </div>

                    <div class="mt-5 space-y-3 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-6 sm:p-8">
                        <div>
                            <h2 class="text-base font-semibold leading-7 text-gray-900">
                                {{ $t('appointmentSettings.form.language') }}
                            </h2>
                            <p class="text-sm leading-6 text-gray-600">
                                {{ $t('appointmentSettings.form.languageLabel') }}
                            </p>
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="language" :label="$t('appointmentSettings.form.language')" />
                            <FormSelect id="language" :options="state.options.languages"
                                v-model="state.formAppointmentSettings.language_uuid" />
                            <FormError
                                :error="v$?.formAppointmentSettings?.language_uuid?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.language_uuid?.[0]" />
                        </div>
                    </div>

                    <div class="mt-5 space-y-3 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-6 sm:p-8">
                        <div>
                            <h2 class="text-base font-semibold leading-7 text-gray-900">
                                {{ $t('appointmentSettings.form.fields.fields') }}
                            </h2>
                            <p class="text-sm leading-6 text-gray-600">
                                {{ $t('appointmentSettings.form.fields.fieldsLabel') }}
                            </p>
                        </div>

                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div class="flex items-center gap-x-2">
                                <FormSwitch :value="!!state.formAppointmentSettings.fields?.email"
                                    @toggleSwitch="toggleField('email')" />
                                <p>
                                    {{ $t('appointmentSettings.form.fields.email') }}
                                </p>
                            </div>
                            <div class="md:col-span-3">
                                <div class="flex items-center gap-x-2"
                                    v-if="state.formAppointmentSettings.fields?.email">
                                    <FormSwitch :value="!!state.formAppointmentSettings.fields?.email?.required"
                                        @toggleSwitch="toggleFieldRequired('email')" />
                                    <p>
                                        {{ $t('appointmentSettings.form.fields.required') }}
                                    </p>
                                </div>
                            </div>
                            <div class="flex items-center gap-x-2">
                                <FormSwitch :value="!!state.formAppointmentSettings.fields?.phone"
                                    @toggleSwitch="toggleField('phone')" />
                                <p>
                                    {{ $t('appointmentSettings.form.fields.phone') }}
                                </p>
                            </div>
                            <div class="md:col-span-3">
                                <div class="flex items-center gap-x-2"
                                    v-if="state.formAppointmentSettings.fields?.phone">
                                    <FormSwitch :value="!!state.formAppointmentSettings.fields?.phone?.required"
                                        @toggleSwitch="toggleFieldRequired('phone')" />
                                    <p>
                                        {{ $t('appointmentSettings.form.fields.required') }}
                                    </p>
                                </div>
                            </div>
                            <div class="flex items-center gap-x-2">
                                <FormSwitch :value="!!state.formAppointmentSettings.fields?.address"
                                    @toggleSwitch="toggleField('address')" />
                                <p>
                                    {{ $t('appointmentSettings.form.fields.address') }}
                                </p>
                            </div>
                            <div class="md:col-span-3">
                                <div class="flex items-center gap-x-2"
                                    v-if="state.formAppointmentSettings.fields?.address">
                                    <FormSwitch :value="!!state.formAppointmentSettings.fields?.address?.required"
                                        @toggleSwitch="toggleFieldRequired('address')" />
                                    <p>
                                        {{ $t('appointmentSettings.form.fields.required') }}
                                    </p>
                                </div>
                            </div>
                            <div class="flex items-center gap-x-2">
                                <FormSwitch :value="!!state.formAppointmentSettings.fields?.notes"
                                    @toggleSwitch="toggleField('notes')" />
                                <p>
                                    {{ $t('appointmentSettings.form.fields.notes') }}
                                </p>
                            </div>
                            <div class="md:col-span-3">
                                <div class="flex items-center gap-x-2"
                                    v-if="state.formAppointmentSettings.fields?.notes">
                                    <FormSwitch :value="!!state.formAppointmentSettings.fields?.notes?.required"
                                        @toggleSwitch="toggleFieldRequired('notes')" />
                                    <p>
                                        {{ $t('appointmentSettings.form.fields.required') }}
                                    </p>
                                </div>
                            </div>
                            <div class="flex items-center gap-x-2">
                                <FormSwitch :value="!!state.formAppointmentSettings.fields?.social_security_number"
                                    @toggleSwitch="toggleField('social_security_number')" />
                                <p>
                                    {{ $t('appointmentSettings.form.fields.socialSecurityNumber') }}
                                </p>
                            </div>
                            <div class="md:col-span-3">
                                <div class="flex items-center gap-x-2"
                                    v-if="state.formAppointmentSettings.fields?.social_security_number">
                                    <FormSwitch
                                        :value="!!state.formAppointmentSettings.fields?.social_security_number?.required"
                                        @toggleSwitch="toggleFieldRequired('social_security_number')" />
                                    <p>
                                        {{ $t('appointmentSettings.form.fields.required') }}
                                    </p>
                                </div>
                            </div>
                            <div class="flex items-center gap-x-2">
                                <FormSwitch :value="!!state.formAppointmentSettings.fields?.date_of_birth"
                                    @toggleSwitch="toggleField('date_of_birth')" />
                                <p>
                                    {{ $t('appointmentSettings.form.fields.dateOfBirth') }}
                                </p>
                            </div>
                            <div class="md:col-span-3">
                                <div class="flex items-center gap-x-2"
                                    v-if="state.formAppointmentSettings.fields?.date_of_birth">
                                    <FormSwitch :value="!!state.formAppointmentSettings.fields?.date_of_birth?.required"
                                        @toggleSwitch="toggleFieldRequired('date_of_birth')" />
                                    <p>
                                        {{ $t('appointmentSettings.form.fields.required') }}
                                    </p>
                                </div>
                            </div>
                            <div class="md:col-span-4 flex items-center gap-x-2">
                                <FormSwitch :value="!!state.formAppointmentSettings.fields?.conditions"
                                    @toggleSwitch="toggleField('conditions')" />
                                <p>
                                    {{ $t('appointmentSettings.form.fields.conditions') }}
                                </p>
                            </div>
                            <div class="md:col-span-4">
                                <div v-if="state.formAppointmentSettings.fields?.conditions">
                                    <p class="text-xs text-gray-600 mb-1">
                                        {{ $t('appointmentSettings.form.fields.conditionsLabel') }}.
                                    </p>
                                    <FormTextField id="conditions" name="conditions"
                                        :placeholder="$t('appointmentSettings.form.fields.conditions')"
                                        v-model="state.formAppointmentSettings.fields.conditions.value" />
                                    <FormError
                                        :error="v$?.formAppointmentSettings?.fields?.conditions?.value?.$errors[0]?.$message.toString()" />
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
import { onlineBookingService } from '@/components/api/user/OnlineBookingService'
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
        name: 'appointmentSettings.appointmentSettings',
        translate: true,
        href: '/calendar/appointments/settings',
    },
]

const state = reactive({
    appointments: [],
    error: {} as Error,
    formAppointmentSettings: {
        header: '',
        link: '',
        image: '',
        is_address_enabled: false,
        is_phone_enabled: false,
        language_uuid: '',
        fields: [],
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
    const form = state.formAppointmentSettings
    const hasConditions = form.fields?.conditions && form.fields.conditions.enabled

    const baseRules: any = {
        formAppointmentSettings: {
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
        baseRules.formAppointmentSettings.fields = {
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

function triggerFileInput() {
    if (image.value) {
        image.value.click()
    }
}

function onFileChange(event: any) {
    const file = event.target.files[0]
    state.formAppointmentSettings.image = event.target.files[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = (e: any) => {
            avatarUrl.value = e.target.result
        }
        reader.readAsDataURL(file)
    }
}

function toggleField(field: string) {
    const fields = { ...state.formAppointmentSettings.fields }

    if (fields[field]) {
        delete fields[field]
    } else {
        fields[field] = field === 'conditions'
            ? { enabled: true, value: '' }
            : { enabled: true, required: false }
    }

    state.formAppointmentSettings.fields = fields
}

function toggleFieldRequired(field: string) {
    const fields = state.formAppointmentSettings.fields || {}

    if (!fields[field]) {
        fields[field] = { enabled: true, required: true }
    } else {
        fields[field].required = !fields[field].required
    }

    state.formAppointmentSettings.fields = { ...fields }
}

async function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        state.error = {}
        state.isPageLoading = true
        try {
            let params = new FormData()
            params.append('header', state.formAppointmentSettings.header)
            params.append('link', state.formAppointmentSettings.link)
            params.append('image', state.formAppointmentSettings.image)
            params.append('is_address_enabled', state.formAppointmentSettings.is_address_enabled)
            params.append('is_phone_enabled', state.formAppointmentSettings.is_phone_enabled)
            params.append('language_uuid', state.formAppointmentSettings.language_uuid)
            params.append('fields', JSON.stringify(state.formAppointmentSettings.fields))
            params.append('has_calendar', state.formAppointmentSettings.has_calendar)
            params.append('is_booking_limit', state.formAppointmentSettings.is_booking_limit)
            params.append('enable_odd_even_times', state.formAppointmentSettings.enable_odd_even_times)
            params.append('is_private_calendar', state.formAppointmentSettings.is_private_calendar)
            const response = await onlineBookingService.saveOnlineBookingSettings(params)
            if (response.data) {
                successAlert(`${t('alert.success')}!`, `${t('appointmentSettings.alert.appointmentSettingsSuccessfullySaved')}.`)
            }
        } catch (error: any) {
            state.error = error
        }
        state.isPageLoading = false
    }
}
</script>