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
                            <div class="flex items-center gap-x-2">
                                <div class="flex flex-1 min-w-0 items-stretch">
                                    <div class="flex items-center px-3 h-11 bg-gray-100 border border-r-0 border-primary rounded-l-md text-sm text-gray-500 whitespace-nowrap shrink-0">
                                        {{ runtimeConfig.public.appBaseURL }}/booking/
                                    </div>
                                    <FormTextField id="link" name="link" class="!rounded-none flex-1 min-w-0"
                                        :placeholder="$t('bookingSettings.form.onlineBookingLinkLabel')"
                                        v-model="state.formBookingSettings.link" />
                                    <div class="flex items-center px-3 h-11 bg-gray-100 border border-l-0 border-primary rounded-r-md text-sm text-gray-500 whitespace-nowrap shrink-0">
                                        /overview
                                    </div>
                                </div>
                                <button type="button" @click="copyBookingLink"
                                    class="shrink-0 flex items-center gap-x-1 h-11 px-3 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 whitespace-nowrap">
                                    <Icon :name="state.linkCopied ? 'ph:check' : 'ph:copy'" size="16" />
                                    {{ state.linkCopied ? $t('bookingSettings.form.linkCopied') : $t('bookingSettings.form.copyLink') }}
                                </button>
                            </div>
                            <FormError :error="v$?.formBookingSettings?.link?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.link?.[0]" />
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

                            <!-- Off by default: a practice of twelve does not want
                                 twelve notices per booking, and a practice of two
                                 covering for each other does. -->
                            <div class="mt-4 flex items-start gap-x-2 border-t border-gray-100 pt-4">
                                <FormSwitch :value="state.formBookingSettings.notify_team_on_booking"
                                    :label="$t('bookingSettings.form.notifyTeam')"
                                    @toggleSwitch="state.formBookingSettings.notify_team_on_booking = !state.formBookingSettings.notify_team_on_booking" />
                                <div>
                                    <p>{{ $t('bookingSettings.form.notifyTeam') }}</p>
                                    <p class="text-xs text-gray-500">
                                        {{ $t('bookingSettings.form.notifyTeamHelp') }}
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

                    <div class="mt-5 space-y-3 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-6 sm:p-8">
                        <div>
                            <h2 class="text-base font-semibold leading-7 text-gray-900">
                                Slots
                            </h2>
                            <p class="text-sm leading-6 text-gray-600">
                                Manage available slots that clients can book
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

                    <div class="mt-6">
                        <FormButton type="submit" buttonStyle="primary" class="w-full">
                            {{ $t('save') }}
                        </FormButton>
                    </div>
                </form>

                <!-- Website booking: a separate config surface (own backend
                     resource, own save action) that publishes a subset of the
                     above as an embeddable widget / hosted link. Kept as its
                     own form since saving it does not touch online_booking_settings
                     at all. -->
                <form @submit.prevent="submitWebsiteBookingForm()" class="mt-10 max-w-3xl" id="formWebsiteBooking">
                    <Alert type="danger" :text="state?.websiteBookingError?.message"
                        v-if="state.websiteBookingError?.message && state.websiteBookingError.message.length > 0" />

                    <div class="mt-3 space-y-3 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-6 sm:p-8">
                        <div class="flex items-start justify-between gap-x-4">
                            <div>
                                <h2 class="text-base font-semibold leading-7 text-gray-900">
                                    {{ $t('websiteBookingSettings.websiteBooking') }}
                                </h2>
                                <p class="text-sm leading-6 text-gray-600">
                                    {{ $t('websiteBookingSettings.form.enableLabel') }}
                                </p>
                            </div>
                            <FormSwitch :value="state.formWebsiteBooking.is_enabled"
                                :label="$t('websiteBookingSettings.form.enable')"
                                @toggleSwitch="state.formWebsiteBooking.is_enabled = !state.formWebsiteBooking.is_enabled" />
                        </div>

                        <div class="space-y-1 border-t border-gray-100 pt-4">
                            <h3 class="text-sm font-semibold text-gray-900">
                                {{ $t('websiteBookingSettings.form.branding') }}
                            </h3>
                            <p class="text-sm text-gray-600">{{ $t('websiteBookingSettings.form.brandingLabel') }}</p>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div class="space-y-1">
                                <FormLabel for="primary_color" :label="$t('websiteBookingSettings.form.primaryColor')" />
                                <input id="primary_color" type="color" v-model="state.formWebsiteBooking.primary_color"
                                    class="h-11 w-full rounded-md border border-gray-300 p-1" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="secondary_color"
                                    :label="$t('websiteBookingSettings.form.secondaryColor')" />
                                <input id="secondary_color" type="color"
                                    v-model="state.formWebsiteBooking.secondary_color"
                                    class="h-11 w-full rounded-md border border-gray-300 p-1" />
                            </div>
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="welcome_text" :label="$t('websiteBookingSettings.form.welcomeText')" />
                            <p class="text-xs text-gray-500">{{ $t('websiteBookingSettings.form.welcomeTextLabel') }}</p>
                            <FormTextField id="welcome_text" name="welcome_text"
                                v-model="state.formWebsiteBooking.welcome_text" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="confirmation_text"
                                :label="$t('websiteBookingSettings.form.confirmationText')" />
                            <p class="text-xs text-gray-500">
                                {{ $t('websiteBookingSettings.form.confirmationTextLabel') }}
                            </p>
                            <FormTextField id="confirmation_text" name="confirmation_text"
                                v-model="state.formWebsiteBooking.confirmation_text" />
                        </div>

                        <div class="space-y-1 border-t border-gray-100 pt-4">
                            <FormLabel for="services" :label="$t('websiteBookingSettings.form.services')" />
                            <p class="text-xs text-gray-500">{{ $t('websiteBookingSettings.form.servicesLabel') }}</p>
                            <FormSelectMultiple id="services" :options="state.options.bookingServices"
                                v-model="state.formWebsiteBooking.service_uuids" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="departments" :label="$t('websiteBookingSettings.form.departments')" />
                            <p class="text-xs text-gray-500">{{ $t('websiteBookingSettings.form.departmentsLabel') }}</p>
                            <FormSelectMultiple id="departments" :options="state.options.departments"
                                v-model="state.formWebsiteBooking.department_uuids" />
                        </div>

                        <div class="space-y-1 border-t border-gray-100 pt-4">
                            <FormLabel for="allowed_domain" :label="$t('websiteBookingSettings.form.allowedDomains')" />
                            <p class="text-xs text-gray-500">
                                {{ $t('websiteBookingSettings.form.allowedDomainsLabel') }}
                            </p>
                            <div class="flex flex-wrap gap-2" v-if="state.formWebsiteBooking.allowed_domains.length">
                                <span v-for="(domain, index) in state.formWebsiteBooking.allowed_domains" :key="domain"
                                    class="inline-flex items-center gap-x-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                                    {{ domain }}
                                    <button type="button" @click="removeAllowedDomain(index)"
                                        class="text-gray-400 hover:text-gray-600">
                                        <Icon name="ph:x" size="14" />
                                    </button>
                                </span>
                            </div>
                            <div class="flex items-center gap-x-2">
                                <FormTextField id="allowed_domain" name="allowed_domain"
                                    :placeholder="$t('websiteBookingSettings.form.domainPlaceholder')"
                                    v-model="state.newAllowedDomain" @keyup.enter.prevent="addAllowedDomain" />
                                <button type="button" @click="addAllowedDomain"
                                    class="shrink-0 h-11 px-4 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                                    {{ $t('websiteBookingSettings.form.addDomain') }}
                                </button>
                            </div>
                        </div>

                        <div class="space-y-3 border-t border-gray-100 pt-4"
                            v-if="state.formWebsiteBooking.embed_token">
                            <div class="space-y-1">
                                <FormLabel for="embed_code" :label="$t('websiteBookingSettings.form.embedCode')" />
                                <p class="text-xs text-gray-500">
                                    {{ $t('websiteBookingSettings.form.embedCodeLabel') }}
                                </p>
                                <div class="flex items-center gap-x-2">
                                    <textarea id="embed_code" readonly rows="2" :value="embedSnippet"
                                        class="flex-1 min-w-0 rounded-md border border-gray-300 p-2 text-xs font-mono text-gray-600 bg-gray-50" />
                                    <button type="button" @click="copyEmbedSnippet"
                                        class="shrink-0 flex items-center gap-x-1 h-11 px-3 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 whitespace-nowrap">
                                        <Icon :name="state.embedCopied ? 'ph:check' : 'ph:copy'" size="16" />
                                        {{ state.embedCopied ? $t('websiteBookingSettings.form.codeCopied') :
                                            $t('websiteBookingSettings.form.copyCode') }}
                                    </button>
                                </div>
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="hosted_link" :label="$t('websiteBookingSettings.form.hostedLink')" />
                                <p class="text-xs text-gray-500">
                                    {{ $t('websiteBookingSettings.form.hostedLinkLabel') }}
                                </p>
                                <div class="flex items-center gap-x-2">
                                    <FormTextField id="hosted_link" name="hosted_link" :modelValue="hostedBookingLink"
                                        placeholder="" readonly class="flex-1 min-w-0" />
                                    <button type="button" @click="copyHostedLink"
                                        class="shrink-0 flex items-center gap-x-1 h-11 px-3 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 whitespace-nowrap">
                                        <Icon :name="state.hostedLinkCopied ? 'ph:check' : 'ph:copy'" size="16" />
                                        {{ state.hostedLinkCopied ? $t('websiteBookingSettings.form.linkCopied') :
                                            $t('websiteBookingSettings.form.copyLink') }}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="mt-6">
                        <FormButton type="submit" buttonStyle="primary" class="w-full">
                            {{ $t('save') }}
                        </FormButton>
                    </div>
                </form>
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import ClassicEditor from '@/utils/editor'
import { languageService } from '@/components/api/user/LanguageService'
import { onlineBookingSettingsService } from '@/components/api/user/OnlineBookingSettingsService'
import { websiteBookingSettingsService } from '@/components/api/user/WebsiteBookingSettingsService'
import { bookingServiceService } from '@/components/api/user/BookingServiceService'
import { departmentService } from '@/components/api/user/DepartmentService'
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
        notify_team_on_booking: false,
        is_phone_enabled: false,
        language_uuid: '',
        fields: [] as any,
        has_calendar: false,
        is_booking_limit: false,
        enable_odd_even_times: false,
        is_private_calendar: false,
    } as any,
    isPageLoading: false,
    linkCopied: false,
    modal: {},
    options: {
        languages: [],
        bookingServices: [] as any,
        departments: [] as any,
    },
    formWebsiteBooking: {
        is_enabled: false,
        embed_token: '',
        primary_color: '#4f46e5',
        secondary_color: '#111827',
        welcome_text: '',
        confirmation_text: '',
        service_uuids: [] as string[],
        department_uuids: [] as string[],
        allowed_domains: [] as string[],
    } as any,
    websiteBookingError: {} as Error,
    newAllowedDomain: '',
    embedCopied: false,
    hostedLinkCopied: false,
})

const embedSnippet = computed(() => {
    if (!state.formWebsiteBooking.embed_token) return ''
    return `<script src="${runtimeConfig.public.appBaseURL}/widget.js" data-embed-token="${state.formWebsiteBooking.embed_token}"><\/script>`
})

const hostedBookingLink = computed(() => {
    if (!state.formWebsiteBooking.embed_token) return ''
    return `${runtimeConfig.public.appBaseURL}/public-booking/${state.formWebsiteBooking.embed_token}`
})

const rules = computed(() => {
    const form = state.formBookingSettings
    const hasConditions = form.fields?.conditions && form.fields.conditions.enabled

    const baseRules: any = {
        formBookingSettings: {
            header: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            link: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            language_uuid: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        }
    }

    if (hasConditions) {
        baseRules.formBookingSettings.fields = {
            conditions: {
                value: {
                    required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
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
    fetchBookingServiceOptions()
    fetchDepartmentOptions()
    fetchWebsiteBookingSettings()
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
    state.isPageLoading = true
    try {
        const response = await onlineBookingSettingsService.getOnlineBookingSettings()
        if (response?.data) {
            state.formBookingSettings = {
                header: response.data?.header,
                link: response.data?.link,
                description: response.data?.description,
                image: '',
                is_address_enabled: response.data?.is_address_enabled ?? false,
                notify_team_on_booking: response.data?.notify_team_on_booking ?? false,
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
    state.isPageLoading = false
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


function copyBookingLink() {
    const link = `${runtimeConfig.public.appBaseURL}/booking/${state.formBookingSettings.link}/overview`
    navigator.clipboard.writeText(link)
    state.linkCopied = true
    setTimeout(() => { state.linkCopied = false }, 2000)
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
            params.append('notify_team_on_booking', state.formBookingSettings.notify_team_on_booking ? 1 : 0)
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

async function fetchBookingServiceOptions() {
    try {
        const response = await bookingServiceService.getBookingServices()
        const items = response?.data?.data ?? response?.data ?? []
        state.options.bookingServices = items.map((item: any) => ({
            value: item.uuid,
            label: item.user ? `${item.name} — ${item.user.firstname} ${item.user.lastname}` : item.name,
        }))
    } catch {
        // A booking-service picker with no options yet is not fatal to the
        // rest of the page — the admin just has nothing to select until one
        // exists.
    }
}

async function fetchDepartmentOptions() {
    try {
        const response = await departmentService.getDepartments({})
        const items = response?.data?.data ?? response?.data ?? []
        state.options.departments = items.map((item: any) => ({
            value: item.uuid,
            label: item.name,
        }))
    } catch {
        // Same as above — an empty department list is not fatal.
    }
}

async function fetchWebsiteBookingSettings() {
    try {
        const response = await websiteBookingSettingsService.getWebsiteBookingSettings()
        if (response?.data && response.data.uuid) {
            state.formWebsiteBooking = {
                is_enabled: response.data.is_enabled ?? false,
                embed_token: response.data.embed_token ?? '',
                primary_color: response.data.primary_color ?? '#4f46e5',
                secondary_color: response.data.secondary_color ?? '#111827',
                welcome_text: response.data.welcome_text ?? '',
                confirmation_text: response.data.confirmation_text ?? '',
                service_uuids: (response.data.services ?? []).map((service: any) => service.uuid),
                department_uuids: (response.data.departments ?? []).map((department: any) => department.uuid),
                allowed_domains: response.data.allowed_domains ?? [],
            }
        }
    } catch (error: any) {
        state.websiteBookingError = error
    }
}

function addAllowedDomain() {
    const domain = state.newAllowedDomain.trim().replace(/^https?:\/\//, '').replace(/\/$/, '')
    if (domain && !state.formWebsiteBooking.allowed_domains.includes(domain)) {
        state.formWebsiteBooking.allowed_domains.push(domain)
    }
    state.newAllowedDomain = ''
}

function removeAllowedDomain(index: number) {
    state.formWebsiteBooking.allowed_domains.splice(index, 1)
}

function copyEmbedSnippet() {
    navigator.clipboard.writeText(embedSnippet.value)
    state.embedCopied = true
    setTimeout(() => { state.embedCopied = false }, 2000)
}

function copyHostedLink() {
    navigator.clipboard.writeText(hostedBookingLink.value)
    state.hostedLinkCopied = true
    setTimeout(() => { state.hostedLinkCopied = false }, 2000)
}

async function submitWebsiteBookingForm() {
    state.websiteBookingError = {}
    state.isPageLoading = true
    try {
        const response = await websiteBookingSettingsService.saveWebsiteBookingSettings({
            is_enabled: state.formWebsiteBooking.is_enabled,
            primary_color: state.formWebsiteBooking.primary_color,
            secondary_color: state.formWebsiteBooking.secondary_color,
            welcome_text: state.formWebsiteBooking.welcome_text,
            confirmation_text: state.formWebsiteBooking.confirmation_text,
            service_uuids: state.formWebsiteBooking.service_uuids,
            department_uuids: state.formWebsiteBooking.department_uuids,
            allowed_domains: state.formWebsiteBooking.allowed_domains,
        })
        if (response?.data) {
            fetchWebsiteBookingSettings()
            successAlert(`${t('alert.success')}!`, `${t('websiteBookingSettings.alert.websiteBookingSuccessfullySaved')}.`)
        }
    } catch (error: any) {
        state.websiteBookingError = error
    }
    state.isPageLoading = false
}
</script>