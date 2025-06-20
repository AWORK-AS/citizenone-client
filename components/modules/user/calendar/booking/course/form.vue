<template>
    <div>
        <nav aria-label="Progress">
            <ol role="list" class="divide-y divide-gray-300 rounded-md border border-gray-300 md:flex md:divide-y-0">
                <li v-for="(step, stepId) in state.steps" :key="stepId" class="relative md:flex md:flex-1">
                    <a v-if="step.status === 'completed'" :href="step.href" class="group flex w-full items-center">
                        <span class="flex items-center px-6 py-4 text-sm font-medium">
                            <span
                                class="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary group-hover:bg-secondary-600">
                                <Icon name="ph:check" class="h-6 w-6 text-white" aria-hidden="true" />
                            </span>
                            <p class="ml-4 text-sm font-medium text-gray-900">
                                <span v-if="step.name === 'Information'">
                                    {{ $t('bookings.formCourse.tabs.information') }}
                                </span>
                                <span v-if="step.name === 'Sessions'">
                                    {{ $t('bookings.formCourse.tabs.sessions') }}
                                </span>
                                <span v-if="step.name === 'Settings'">
                                    {{ $t('bookings.formCourse.tabs.settings') }}
                                </span>
                                <span v-if="step.name === 'Summary'">
                                    {{ $t('bookings.formCourse.tabs.summary') }}
                                </span>
                            </p>
                        </span>
                    </a>
                    <a v-else-if="step.status === 'current'" :href="step.href"
                        class="flex items-center px-6 py-4 text-sm font-medium" aria-current="step">
                        <span
                            class="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-secondary">
                            <span class="text-secondary">{{ step.id }}</span>
                        </span>
                        <p class="ml-4 text-sm font-medium text-secondary">
                            <span v-if="step.name === 'Information'">
                                {{ $t('bookings.formCourse.tabs.information') }}
                            </span>
                            <span v-if="step.name === 'Sessions'">
                                {{ $t('bookings.formCourse.tabs.sessions') }}
                            </span>
                            <span v-if="step.name === 'Settings'">
                                {{ $t('bookings.formCourse.tabs.settings') }}
                            </span>
                            <span v-if="step.name === 'Summary'">
                                {{ $t('bookings.formCourse.tabs.summary') }}
                            </span>
                        </p>
                    </a>
                    <a v-else :href="step.href" class="group flex items-center">
                        <span class="flex items-center px-6 py-4 text-sm font-medium">
                            <span
                                class="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-gray-300 group-hover:border-gray-400">
                                <span class="text-gray-500 group-hover:text-gray-900">{{ step.id }}</span>
                            </span>
                            <p class="ml-4 text-sm font-medium text-gray-500 group-hover:text-gray-900">
                                <span v-if="step.name === 'Information'">
                                    {{ $t('bookings.formCourse.tabs.information') }}
                                </span>
                                <span v-if="step.name === 'Sessions'">
                                    {{ $t('bookings.formCourse.tabs.sessions') }}
                                </span>
                                <span v-if="step.name === 'Settings'">
                                    {{ $t('bookings.formCourse.tabs.settings') }}
                                </span>
                                <span v-if="step.name === 'Summary'">
                                    {{ $t('bookings.formCourse.tabs.summary') }}
                                </span>
                            </p>
                        </span>
                    </a>
                    <template v-if="stepId !== state.steps.length - 1">
                        <!-- Arrow separator for lg screens and up -->
                        <div class="absolute right-0 top-0 hidden h-full w-5 md:block" aria-hidden="true">
                            <svg class="size-full text-gray-300" viewBox="0 0 22 80" fill="none"
                                preserveAspectRatio="none">
                                <path d="M0 -2L20 40L0 82" vector-effect="non-scaling-stroke" stroke="currentcolor"
                                    stroke-linejoin="round" />
                            </svg>
                        </div>
                    </template>
                </li>
            </ol>
        </nav>
        <form @submit.prevent="handleNext()" class="mt-6">
            <Alert type="danger" :text="props?.error?.message"
                v-if="props.error?.message && props.error.message.length > 0" />
            <div class="space-y-3" v-if="state.currentStep === 1">
                <div class="space-y-1">
                    <FormLabel for="name" :label="$t('bookings.formCourse.information.name')" />
                    <FormTextField id="name" name="name" :placeholder="$t('bookings.formCourse.information.name')"
                        v-model="state.formCourse.name" />
                    <FormError :error="v$?.formCourse?.name?.$errors[0]?.$message.toString()" />
                    <FormError :error="state?.error?.errors?.name?.[0]" />
                </div>
                <div class="space-y-1">
                    <p class="text-sm text-gray-600">
                        {{ $t('bookings.formCourse.information.description') }}
                    </p>
                    <ckeditor :editor="editor" v-model="state.formCourse.description" :config="editorDescriptionConfig">
                    </ckeditor>
                    <FormError :error="v$?.formCourse?.description?.$errors[0]?.$message.toString()" />
                    <FormError :error="state?.error?.errors?.description?.[0]" />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div class="md:col-span-3 space-y-3">
                        <div class="space-y-1">
                            <FormLabel for="address" :label="$t('bookings.formCourse.information.address')" />
                            <FormTextField id="address" name="address"
                                :placeholder="$t('bookings.formCourse.information.address')"
                                v-model="state.formCourse.address" />
                            <FormError :error="v$?.formCourse?.address?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.address?.[0]" />
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div class="space-y-1">
                                <FormLabel for="post_code" :label="$t('bookings.formCourse.information.postcode')" />
                                <FormTextField id="post_code" name="post_code"
                                    :placeholder="$t('bookings.formCourse.information.postcode')"
                                    v-model="state.formCourse.post_code" />
                                <FormError :error="v$?.formCourse?.post_code?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.post_code?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="city" :label="$t('bookings.formCourse.information.city')" />
                                <FormTextField id="city" name="city"
                                    :placeholder="$t('bookings.formCourse.information.city')"
                                    v-model="state.formCourse.city" />
                                <FormError :error="v$?.formCourse?.city?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.city?.[0]" />
                            </div>
                        </div>
                    </div>
                    <div class="md:col-span-1">
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
                            <FormError :error="v$?.formCourse?.image?.$errors[0]?.$message.toString()"
                                class="text-center" />
                            <FormError :error="state?.error?.errors?.image?.[0]" class="text-center" />
                        </div>
                    </div>
                </div>
            </div>
            <div class="space-y-3" v-if="state.currentStep === 2">
                <div class="space-y-6">
                    <div v-for="(session, sessionIndex) in state.formCourse.sessions" :key="sessionIndex"
                        class="relative">
                        <div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg space-y-3 px-4 py-6 sm:p-8">
                            <div class="flex items-center gap-x-2">
                                <div class="grow grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div class="space-y-1">
                                        <FormLabel :for="`name_${sessionIndex}`"
                                            :label="$t('bookings.formCourse.sessions.name')" />
                                        <FormTextField :id="`name_${sessionIndex}`" :name="`name_${sessionIndex}`"
                                            :required="true" :placeholder="$t('bookings.formCourse.sessions.name')"
                                            :value="session.name"
                                            @keyup="(event: any) => state.formCourse.sessions[sessionIndex].name = event.target.value" />
                                    </div>
                                    <div class="space-y-1">
                                        <FormLabel :for="`date_time_start_${sessionIndex}`"
                                            :label="$t('bookings.formCourse.sessions.dateTimeStart')" />
                                        <FormDateTimeField :id="`date_time_start_${sessionIndex}`"
                                            :name="`date_time_start_${sessionIndex}`"
                                            :placeholder="`${$t('bookings.formCourse.sessions.dateTimeStart')}`"
                                            v-model="state.formCourse.sessions[sessionIndex].date_time_start" />
                                        <FormError
                                            :error="v$?.formCourse?.sessions?.[sessionIndex]?.date_time_start?.$errors[0]?.$message.toString()" />
                                    </div>
                                    <div class="space-y-1">
                                        <FormLabel :for="`date_time_end_${sessionIndex}`"
                                            :label="$t('bookings.formCourse.sessions.dateTimeEnd')" />
                                        <FormDateTimeField :id="`date_time_end_${sessionIndex}`"
                                            :name="`date_time_end_${sessionIndex}`"
                                            :placeholder="`${$t('bookings.formCourse.sessions.dateTimeEnd')}`"
                                            v-model="state.formCourse.sessions[sessionIndex].date_time_end" />
                                        <FormError
                                            :error="v$?.formCourse?.sessions?.[sessionIndex]?.date_time_end?.$errors[0]?.$message.toString()" />
                                    </div>
                                </div>
                                <div>
                                    <Tooltip :text="$t('bookings.formEvent.information.createMultipleEvents')"
                                        position="left" class="mt-7">
                                        <button type="button"
                                            @click="state.formCourse.sessions[sessionIndex].is_recurring = !state.formCourse.sessions[sessionIndex].is_recurring">
                                            <Icon name="ph:repeat" class="h-6 w-6" aria-hidden="true" />
                                        </button>
                                    </Tooltip>
                                </div>
                            </div>
                            <div class="block md:flex items-center space-y-2 gap-x-2 py-2"
                                v-if="state.formCourse.sessions[sessionIndex].is_recurring">
                                <p>
                                    {{ $t('bookings.formCourse.sessions.recurring.addThisSessions') }}
                                </p>
                                <div class="space-y-1 grow">
                                    <FormSelect :id="`recurring_${sessionIndex}`"
                                        :options="state.options.recurringSchedules"
                                        v-model="state.formCourse.sessions[sessionIndex].recurring" />
                                </div>
                                <p>
                                    {{ $t('bookings.formCourse.sessions.recurring.until') }}
                                </p>
                                <div>
                                    <FormDateField :id="`recurring_until_${sessionIndex}`" name="recurring_until"
                                        :placeholder="`${$t('bookings.formEvent.information.recurring.until')}`"
                                        v-model="state.formCourse.sessions[sessionIndex].recurring_until" />
                                </div>
                            </div>
                            <div>
                                <div class="space-y-1">
                                    <p class="text-sm text-gray-600">
                                        {{ $t('bookings.formCourse.information.description') }}
                                    </p>
                                    <ckeditor :editor="editor"
                                        v-model="state.formCourse.sessions[sessionIndex].description"
                                        :config="editorDescriptionConfig">
                                    </ckeditor>
                                </div>
                            </div>
                        </div>
                        <button type="button"
                            class="absolute -top-3 -right-3 bg-red-700 hover:bg-red-600 rounded-full w-8 h-8 flex items-center justify-center"
                            @click="removeSession(sessionIndex)" v-if="state.formCourse.sessions.length > 2">
                            <Icon name="ph:trash" class="h-4 w-4 text-white" aria-hidden="true" />
                        </button>
                        <button type="button"
                            class="absolute -bottom-4 inset-x-1/2 shadow-md bg-secondary hover:bg-secondary-800 rounded-full w-8 h-8 flex items-center justify-center"
                            @click="addSession()" v-if="sessionIndex === state.formCourse.sessions.length - 1">
                            <Icon name="ph:plus" class="h-4 w-4 text-white" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>
            <div class="space-y-3" v-if="state.currentStep === 3">
                <div class="space-y-1">
                    <FormLabel for="spots" :label="$t('bookings.formCourse.settings.availableSpotsAtThisEvent')" />
                    <FormNumberField id="spots" name="spots"
                        :placeholder="$t('bookings.formCourse.settings.availableSpotsAtThisEvent')"
                        v-model="state.formCourse.spots" @input="validateSpotsQuantity" />
                    <FormError :error="v$?.formCourse?.spots?.$errors[0]?.$message.toString()" />
                    <FormError :error="state?.error?.errors?.spots?.[0]" />
                </div>
                <div class="space-y-1">
                    <div class="flex justify-between items-center py-0.5">
                        <FormLabel for="schedule_tag_uuid" :label="$t('dutySchedules.form.tags')" />
                        <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                            @click="state.modal.isAddNewBookingTag = true">
                            {{ $t('bookingTags.addNewBookingTag') }}
                        </span>
                    </div>
                    <FormSelectMultiple id="schedule_tag_uuid" name="schedule_tag_uuid"
                        :options="state.options.bookingTags" v-model="state.formCourse.tags" />
                    <FormError :error="v$?.formCourse?.tags?.$errors[0]?.$message.toString()" />
                    <FormError :error="state?.error?.errors?.tags?.[0]" />
                </div>
                <div class="flex items-center gap-x-5">
                    <div class="grow space-y-1">
                        <FormLabel for="price" :label="$t('bookings.formCourse.settings.price')" />
                        <FormTextField id="price" name="price" :placeholder="$t('bookings.formCourse.settings.price')"
                            v-model="state.formCourse.price" />
                        <FormError :error="v$?.formCourse?.price?.$errors[0]?.$message.toString()" />
                        <FormError :error="state?.error?.errors?.price?.[0]" />
                    </div>
                    <div class="mt-6 flex items-center">
                        <div class="space-y-1 flex items-center gap-x-2">
                            <FormSwitch :value="state.formCourse.is_tax_included"
                                @toggleSwitch="state.formCourse.is_tax_included = !state.formCourse.is_tax_included" />
                            <p>
                                {{ $t('bookings.formCourse.settings.tax') }}
                            </p>
                        </div>
                    </div>
                </div>
                <div class="space-y-1">
                    <h2 class="text-base font-semibold leading-7 text-gray-900">
                        {{ $t('bookings.formCourse.settings.otherSettings.otherSettings') }}
                    </h2>
                    <div class="flex items-center gap-x-2">
                        <FormSwitch :value="state.formCourse.show_spots_left"
                            @toggleSwitch="state.formCourse.show_spots_left = !state.formCourse.show_spots_left" />
                        <p>
                            {{
                                $t('bookings.formCourse.settings.otherSettings.dontShowTheNumberOfSpotsLeftOnTheSubmitForm')
                            }}
                        </p>
                    </div>
                    <div class="flex items-center gap-x-2">
                        <FormSwitch :value="state.formCourse.close_registration"
                            @toggleSwitch="state.formCourse.close_registration = !state.formCourse.close_registration" />
                        <p>
                            {{ $t('bookings.formCourse.settings.otherSettings.closeRegistration') }}
                        </p>
                    </div>
                    <div class="flex items-center gap-x-2">
                        <FormSwitch :value="state.formCourse.is_online_booking"
                            @toggleSwitch="state.formCourse.is_online_booking = !state.formCourse.is_online_booking" />
                        <p>
                            {{ $t('bookings.formCourse.settings.otherSettings.dontShowInOnlineBooking') }}
                        </p>
                    </div>
                </div>
                <div class="space-y-1">
                    <h2 class="text-base font-semibold leading-7 text-gray-900">
                        {{ $t('bookings.formCourse.settings.notification.notification') }}
                    </h2>
                    <div class="flex items-center gap-x-2">
                        <FormSwitch :value="state.formCourse.is_reminder_enabled"
                            @toggleSwitch="state.formCourse.is_reminder_enabled = !state.formCourse.is_reminder_enabled" />
                        <p>
                            {{
                                $t('bookings.formCourse.settings.notification.sendAnEmailToAllParticipants1DayBeforeTheEvent')
                            }}
                        </p>
                    </div>
                </div>
            </div>
            <div class="space-y-3" v-if="state.currentStep === 4">
                <Alert type="success" :text="t('bookings.alert.courseSuccessfullyAdded')" />
                <div>
                    <p class="text-gray-600">
                        {{ $t('bookings.formCourse.summary.signupForTheEventOnThisAddress') }}:
                    </p>
                    <div class="text-secondary underline cursor-pointer"
                        @click="navigateToExternalLink(`${runtimeConfig.public.appBaseURL}/booking/${state.bookingSettings?.link}/event/${props.courseData?.uuid}`)">
                        {{ runtimeConfig.public.appBaseURL }}/booking/{{ state.bookingSettings?.link }}/event/{{
                            props.courseData?.uuid }}
                    </div>
                </div>
                <div>
                    <p class="text-sm text-gray-600">
                        {{ $t('bookings.formCourse.summary.youCanFindAListOfAllFutureEvents') }}:
                    </p>
                    <div class="text-secondary underline cursor-pointer"
                        @click="navigateToExternalLink(`${runtimeConfig.public.appBaseURL}/booking/${state.bookingSettings?.link}/overview`)">
                        {{ runtimeConfig.public.appBaseURL }}/booking/{{ state.bookingSettings?.link }}/overview
                    </div>
                </div>
            </div>
            <div class="mt-10">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3" v-if="state.currentStep === 4">
                    <FormButton type="button" buttonStyle="cancel" class="col-start-2 rounded-md" @click="closeForm()">
                        {{ $t('close') }}
                    </FormButton>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3" v-else>
                    <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="emit('closeModal')"
                        v-if="state.currentStep === 1">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="handleBack()"
                        v-if="state.currentStep === 2 || state.currentStep === 3">
                        {{ $t('back') }}
                    </FormButton>
                    <FormButton type="submit" buttonStyle="primary" class="rounded-md"
                        v-if="state.currentStep === 1 || state.currentStep === 2">
                        {{ $t('next') }}
                    </FormButton>
                    <FormButton type="submit" buttonStyle="primary" class="rounded-md" v-if="state.currentStep === 3">
                        {{ props.formType === 'create' ? $t('save') :
                            $t('update') }}
                    </FormButton>
                </div>
            </div>
        </form>
        <ModulesUserBookingTagModalNew :isModalOpen="state.modal.isAddNewBookingTag"
            @close="state.modal.isAddNewBookingTag = false" @refreshBookingTags="fetchAllBookingTags" />
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { onlineBookingSettingsService } from '@/components/api/user/OnlineBookingSettingsService'
import { bookingTagService } from '@/components/api/user/BookingTagService'
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
    selectedCourse: {
        type: Object,
        required: true,
    },
    courseData: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['isPageLoading', 'submitForm', 'closeModal', 'closeModalSelection'])

const runtimeConfig = useRuntimeConfig()
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

const state = reactive({
    bookingSettings: {} as any,
    currentStep: 1,
    error: {} as Error,
    formCourse: {
        name: '',
        description: '',
        address: '',
        post_code: '',
        city: '',
        image: '',
        sessions: props.selectedCourse.sessions,
        spots: props.selectedCourse.spots || '1',
        tags: [],
        price: '',
        is_tax_included: false,
        show_spots_left: false,
        close_registration: false,
        is_online_booking: false,
        is_reminder_enabled: false,
    },
    isPageLoading: false,
    modal: {
        isAddNewBookingTag: false,
    },
    options: {
        bookingTags: [],
        recurringSchedules: [
            { value: 'everyday', label: `${t('bookings.formCourse.sessions.recurring.everyDay')}` },
            { value: 'every_week', label: `${t('bookings.formCourse.sessions.recurring.everyWeek')}` },
            { value: 'every_second_week', label: `${t('bookings.formCourse.sessions.recurring.everySecondWeek')}` },
            { value: 'every_third_week', label: `${t('bookings.formCourse.sessions.recurring.everyThirdWeek')}` },
            { value: 'every_fourth_week', label: `${t('bookings.formCourse.sessions.recurring.everyFourthWeek')}` },
            { value: 'every_month', label: `${t('bookings.formCourse.sessions.recurring.everyMonth')}` },
        ]
    },
    steps: [
        { id: '01', name: 'Information', href: '#', status: 'current' },
        { id: '02', name: 'Sessions', href: '#', status: 'upcoming' },
        { id: '03', name: 'Settings', href: '#', status: 'upcoming' },
        { id: '04', name: 'Summary', href: '#', status: 'upcoming' },
    ],
})

// watch(() => props.selectedCourse, (newValue: any) => {
//     if (newValue != null) {
//         state.formCourse = {
//             date_time_start: newValue.date_time_start,
//             date_time_end: newValue.date_time_end,
//             recurring: newValue.recurring,
//             recurring_until: newValue.recurring_until,
//             name: newValue.name,
//             description: newValue.description,
//             address: newValue.address,
//             post_code: newValue.post_code,
//             city: newValue.city,
//             image: newValue.image,
//             spots: newValue.spots,
//             tags: newValue.tags,
//             price: newValue.price,
//             is_tax_included: newValue.is_tax_included,
//             show_spots_left: newValue.show_spots_left,
//             close_registration: newValue.close_registration,
//             is_online_booking: newValue.is_online_booking,
//             is_reminder_enabled: newValue.is_reminder_enabled,
//         }
//     }
// })

watch(() => props.courseData, (courseData: object) => {
    if (courseData) {
        handleNext()
    }
})

onMounted(() => {
    fetchBookingSettings()
    fetchAllBookingTags()
})

const rules = computed(() => {
    return {
        formCourse: {
            name: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            spots: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})
const v$ = useVuelidate(rules, state)

function closeForm() {
    emit('closeModal')
    emit('closeModalSelection')
}

async function fetchBookingSettings() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await onlineBookingSettingsService.getOnlineBookingSettings()
        if (response?.data) {
            state.bookingSettings = response?.data
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchAllBookingTags() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await bookingTagService.getAllBookingTags()
        if (response?.data) {
            let options: any = []
            response.data.forEach(
                (tag: any) => options.push({
                    value: tag?.uuid,
                    label: tag?.tag,
                })
            )
            state.options.bookingTags = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function handleBack() {
    if (state.currentStep === 2) {
        state.currentStep = 1
        state.steps = [
            { id: '01', name: 'Information', href: '#', status: 'current' },
            { id: '02', name: 'Sessions', href: '#', status: 'upcoming' },
            { id: '03', name: 'Settings', href: '#', status: 'upcoming' },
            { id: '04', name: 'Summary', href: '#', status: 'upcoming' },
        ]
    } else if (state.currentStep === 3) {
        state.currentStep = 2
        state.steps = [
            { id: '01', name: 'Information', href: '#', status: 'completed' },
            { id: '02', name: 'Sessions', href: '#', status: 'current' },
            { id: '03', name: 'Settings', href: '#', status: 'upcoming' },
            { id: '04', name: 'Summary', href: '#', status: 'upcoming' },
        ]
    }
}

function handleNext() {
    if (state.currentStep === 1) {
        v$.value.$validate()
        if (!v$.value.$error) {
            state.currentStep = 2
            state.steps = [
                { id: '01', name: 'Information', href: '#', status: 'completed' },
                { id: '02', name: 'Sessions', href: '#', status: 'current' },
                { id: '03', name: 'Settings', href: '#', status: 'upcoming' },
                { id: '04', name: 'Summary', href: '#', status: 'upcoming' },
            ]
        }
    }
    else if (state.currentStep === 2) {
        v$.value.$validate()
        if (!v$.value.$error) {
            state.currentStep = 3
            state.steps = [
                { id: '01', name: 'Information', href: '#', status: 'completed' },
                { id: '02', name: 'Sessions', href: '#', status: 'completed' },
                { id: '03', name: 'Settings', href: '#', status: 'current' },
                { id: '04', name: 'Summary', href: '#', status: 'upcoming' },
            ]
        }
    }
    else if (state.currentStep === 3 && Object.keys(props.courseData)?.length === 0) {
        submitForm()
    }
    else if (state.currentStep === 3 && Object.keys(props.courseData)?.length > 0) {
        state.currentStep = 4
        state.steps = [
            { id: '01', name: 'Information', href: '#', status: 'completed' },
            { id: '02', name: 'Sessions', href: '#', status: 'completed' },
            { id: '03', name: 'Settings', href: '#', status: 'completed' },
            { id: '04', name: 'Summary', href: '#', status: 'current' },
        ]
    } else {
        console.log('not working')
    }
}

function triggerFileInput() {
    if (image.value) {
        image.value.click()
    }
}

function onFileChange(event: any) {
    const file = event.target.files[0]
    state.formCourse.image = event.target.files[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = (e: any) => {
            avatarUrl.value = e.target.result
        }
        reader.readAsDataURL(file)
    }
}

function addSession() {
    state.formCourse.sessions.push({
        name: '',
        date_time_start: moment().startOf('day').add(8, 'hours').format('YYYY-MM-DD H:mm'),
        date_time_end: moment().startOf('day').add(17, 'hours').format('YYYY-MM-DD H:mm'),
        description: '',
        recurring: '',
        recurring_until: moment().format('YYYY-MM-DD'),
    })
}

function removeSession(index: number) {
    state.formCourse.sessions.splice(index, 1)
}

function validateSpotsQuantity(event: Event) {
    const input = event.target as HTMLInputElement
    input.value = input.value.replace(/[^0-9]/g, '').slice(0, 10)
    if (input.value === '0') {
        input.value = '1'
    }
    state.formCourse.spots = input.value
}

async function navigateToExternalLink(link: string) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    await navigateTo(link, {
        external: true,
        open: {
            target: '_blank',
        }
    })
}

function submitForm() {
    if (state.currentStep === 3) {
        state.error = {}
        v$.value.$validate()
        if (!v$.value.$error) {
            emit('submitForm', state.formCourse)
        }
    }
}
</script>