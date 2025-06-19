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
                    <FormLabel for="name" :label="$t('bookings.formEvent.information.name')" />
                    <FormTextField id="name" name="name" :placeholder="$t('bookings.formEvent.information.name')"
                        v-model="state.formEvent.name" />
                    <FormError :error="v$?.formEvent?.name?.$errors[0]?.$message.toString()" />
                    <FormError :error="state?.error?.errors?.name?.[0]" />
                </div>
                <div class="space-y-1">
                    <p class="text-sm text-gray-600">
                        {{ $t('bookings.formEvent.information.description') }}
                    </p>
                    <ckeditor :editor="editor" v-model="state.formEvent.description" :config="editorDescriptionConfig">
                    </ckeditor>
                    <FormError :error="v$?.formEvent?.description?.$errors[0]?.$message.toString()" />
                    <FormError :error="state?.error?.errors?.description?.[0]" />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div class="md:col-span-3">
                        <div class="space-y-1">
                            <FormLabel for="address" :label="$t('bookings.formEvent.information.address')" />
                            <FormTextField id="address" name="address"
                                :placeholder="$t('bookings.formEvent.information.address')"
                                v-model="state.formEvent.address" />
                            <FormError :error="v$?.formEvent?.address?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.address?.[0]" />
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div class="space-y-1">
                                <FormLabel for="post_code" :label="$t('bookings.formEvent.information.postcode')" />
                                <FormTextField id="post_code" name="post_code"
                                    :placeholder="$t('bookings.formEvent.information.postcode')"
                                    v-model="state.formEvent.post_code" />
                                <FormError :error="v$?.formEvent?.post_code?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.post_code?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="city" :label="$t('bookings.formEvent.information.city')" />
                                <FormTextField id="city" name="city"
                                    :placeholder="$t('bookings.formEvent.information.city')"
                                    v-model="state.formEvent.city" />
                                <FormError :error="v$?.formEvent?.city?.$errors[0]?.$message.toString()" />
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
                            <FormError :error="v$?.formEvent?.image?.$errors[0]?.$message.toString()"
                                class="text-center" />
                            <FormError :error="state?.error?.errors?.image?.[0]" class="text-center" />
                        </div>
                    </div>
                </div>
            </div>
            <div class="space-y-3" v-if="state.currentStep === 2">

            </div>
            <div class="space-y-3" v-if="state.currentStep === 3">
                <div class="space-y-1">
                    <FormLabel for="spots" :label="$t('bookings.formEvent.settings.availableSpotsAtThisEvent')" />
                    <FormNumberField id="spots" name="spots" placeholder="1" v-model="state.formEvent.spots"
                        @input="validateSpotsQuantity" />
                    <FormError :error="v$?.formEvent?.spots?.$errors[0]?.$message.toString()" />
                    <FormError :error="state?.error?.errors?.spots?.[0]" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="tags" :label="$t('bookings.formEvent.settings.tags')" />
                    <FormTags id="tags" name="tags" :placeholder="$t('bookings.formEvent.settings.tags')"
                        v-model="state.formEvent.tags" />
                    <FormError :error="v$?.formEvent?.tags?.$errors[0]?.$message.toString()" />
                    <FormError :error="state?.error?.errors?.tags?.[0]" />
                </div>
                <div class="flex items-center gap-x-5">
                    <div class="grow space-y-1">
                        <FormLabel for="price" :label="$t('bookings.formEvent.settings.price')" />
                        <FormTextField id="price" name="price" placeholder="1" v-model="state.formEvent.price" />
                        <FormError :error="v$?.formEvent?.price?.$errors[0]?.$message.toString()" />
                        <FormError :error="state?.error?.errors?.price?.[0]" />
                    </div>
                    <div class="mt-6 flex items-center">
                        <div class="space-y-1 flex items-center gap-x-2">
                            <FormSwitch :value="state.formEvent.tax"
                                @toggleSwitch="state.formEvent.tax = !state.formEvent.tax" />
                            <p>
                                {{ $t('bookings.formEvent.settings.tax') }}
                            </p>
                        </div>
                    </div>
                </div>
                <div class="space-y-1">
                    <h2 class="text-base font-semibold leading-7 text-gray-900">
                        {{ $t('bookings.formEvent.settings.otherSettings.otherSettings') }}
                    </h2>
                    <div class="flex items-center gap-x-2">
                        <FormSwitch :value="state.formEvent.show_spots_left"
                            @toggleSwitch="state.formEvent.show_spots_left = !state.formEvent.show_spots_left" />
                        <p>
                            {{
                                $t('bookings.formEvent.settings.otherSettings.dontShowTheNumberOfSpotsLeftOnTheSubmitForm')
                            }}
                        </p>
                    </div>
                    <div class="flex items-center gap-x-2">
                        <FormSwitch :value="state.formEvent.close_registration"
                            @toggleSwitch="state.formEvent.close_registration = !state.formEvent.close_registration" />
                        <p>
                            {{ $t('bookings.formEvent.settings.otherSettings.closeRegistration') }}
                        </p>
                    </div>
                    <div class="flex items-center gap-x-2">
                        <FormSwitch :value="state.formEvent.is_online_booking"
                            @toggleSwitch="state.formEvent.is_online_booking = !state.formEvent.is_online_booking" />
                        <p>
                            {{ $t('bookings.formEvent.settings.otherSettings.dontShowInOnlineBooking') }}
                        </p>
                    </div>
                </div>
                <div class="space-y-1">
                    <h2 class="text-base font-semibold leading-7 text-gray-900">
                        {{ $t('bookings.formEvent.settings.notification.notification') }}
                    </h2>
                    <div class="flex items-center gap-x-2">
                        <FormSwitch :value="state.formEvent.is_reminder_enabled"
                            @toggleSwitch="state.formEvent.is_reminder_enabled = !state.formEvent.is_reminder_enabled" />
                        <p>
                            {{
                                $t('bookings.formEvent.settings.notification.sendAnEmailToAllParticipants1DayBeforeTheEvent')
                            }}
                        </p>
                    </div>
                </div>
            </div>
            <div class="mt-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3" v-if="state.currentStep === 4">
                    <FormButton type="button" buttonStyle="cancel" class="col-start-2 rounded-md"
                        @click="emit('closeModal')">
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
    </div>
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
    selectedEvent: {
        type: Object,
        required: true,
    },
    isSuccessfullyCreated: {
        type: Boolean,
        required: true,
    },
})

const emit = defineEmits(['isPageLoading', 'submitForm', 'closeModal'])

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
    currentStep: 1,
    error: {} as Error,
    formEvent: {
        name: '',
        description: '',
        address: '',
        post_code: '',
        city: '',
        image: '',
        sessions: [],
        spots: '',
        tags: [],
        price: '',
        tax: false,
        show_spots_left: false,
        close_registration: false,
        is_online_booking: false,
        is_reminder_enabled: false,
    },
    options: {
        recurringSchedules: [
            { value: 'every_day', label: `${t('bookings.formEvent.information.recurring.everyDay')}` },
            { value: 'every_week', label: `${t('bookings.formEvent.information.recurring.everyWeek')}` },
            { value: 'every_second_week', label: `${t('bookings.formEvent.information.recurring.everySecondWeek')}` },
            { value: 'every_third_week', label: `${t('bookings.formEvent.information.recurring.everyThirdWeek')}` },
            { value: 'every_fourth_week', label: `${t('bookings.formEvent.information.recurring.everyFourthWeek')}` },
            { value: 'every_month', label: `${t('bookings.formEvent.information.recurring.everyMonth')}` },
        ]
    },
    steps: [
        { id: '01', name: 'Information', href: '#', status: 'current' },
        { id: '02', name: 'Sessions', href: '#', status: 'upcoming' },
        { id: '03', name: 'Settings', href: '#', status: 'upcoming' },
        { id: '04', name: 'Summary', href: '#', status: 'upcoming' },
    ],
})

// watch(() => props.selectedEvent, (newValue: any) => {
//     if (newValue != null) {
//         state.formEvent = {
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
//             tax: newValue.tax,
//             show_spots_left: newValue.show_spots_left,
//             close_registration: newValue.close_registration,
//             is_online_booking: newValue.is_online_booking,
//             is_reminder_enabled: newValue.is_reminder_enabled,
//         }
//     }
// })

watch(() => props.isSuccessfullyCreated, (isSuccessfullyCreated: boolean) => {
    if (isSuccessfullyCreated) {
        handleNext()
    }
})

const rules = computed(() => {
    return {
        formEvent: {
            name: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})
const v$ = useVuelidate(rules, state)

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
    else if (state.currentStep === 3 && !props.isSuccessfullyCreated) {
        submitForm()
    }
    else if (state.currentStep === 3 && props.isSuccessfullyCreated) {
        state.currentStep = 4
        state.steps = [
            { id: '01', name: 'Information', href: '#', status: 'completed' },
            { id: '02', name: 'Sessions', href: '#', status: 'completed' },
            { id: '03', name: 'Settings', href: '#', status: 'completed' },
            { id: '04', name: 'Summary', href: '#', status: 'current' },
        ]
    }
}

function triggerFileInput() {
    if (image.value) {
        image.value.click()
    }
}

function onFileChange(event: any) {
    const file = event.target.files[0]
    state.formEvent.image = event.target.files[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = (e: any) => {
            avatarUrl.value = e.target.result
        }
        reader.readAsDataURL(file)
    }
}

function validateSpotsQuantity(event: Event) {
    const input = event.target as HTMLInputElement
    input.value = input.value.replace(/[^1-9]/g, '').slice(0, 10)
    state.formEvent.spots = input.value
}

function submitForm() {
    if (state.currentStep === 2) {
        state.error = {}
        v$.value.$validate()
        if (!v$.value.$error) {
            emit('submitForm', state.formEvent)
        }
    }
}
</script>