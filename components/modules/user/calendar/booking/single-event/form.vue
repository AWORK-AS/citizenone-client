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
                                    {{ $t('bookings.formEvent.tabs.information') }}
                                </span>
                                <span v-if="step.name === 'Slots'">
                                    Slots
                                </span>
                                <span v-if="step.name === 'Settings'">
                                    {{ $t('bookings.formEvent.tabs.settings') }}
                                </span>
                                <span v-if="step.name === 'Summary'">
                                    {{ $t('bookings.formEvent.tabs.summary') }}
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
                                {{ $t('bookings.formEvent.tabs.information') }}
                            </span>
                            <span v-if="step.name === 'Slots'">
                                Slots
                            </span>
                            <span v-if="step.name === 'Settings'">
                                {{ $t('bookings.formEvent.tabs.settings') }}
                            </span>
                            <span v-if="step.name === 'Summary'">
                                {{ $t('bookings.formEvent.tabs.summary') }}
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
                                    {{ $t('bookings.formEvent.tabs.information') }}
                                </span>
                                <span v-if="step.name === 'Slots'">
                                    Slots
                                </span>
                                <span v-if="step.name === 'Settings'">
                                    {{ $t('bookings.formEvent.tabs.settings') }}
                                </span>
                                <span v-if="step.name === 'Summary'">
                                    {{ $t('bookings.formEvent.tabs.summary') }}
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
        <form @submit.prevent="" class="mt-6">
            <Alert type="danger" :text="props?.error?.message"
                v-if="props.error?.message && props.error.message.length > 0" />
            <div class="space-y-3" v-if="state.currentStep === 1">
                <div class="flex items-center gap-x-2">
                    <div class="grow grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div class="space-y-1">
                            <FormLabel for="date_time_start"
                                :label="$t('bookings.formEvent.information.dateTimeStart')" />
                            <FormDateTimeField id="date_time_start" name="date_time_start"
                                :placeholder="`${$t('bookings.formEvent.information.dateTimeStart')}`"
                                v-model="state.formEvent.date_time_start" />
                            <FormError :error="v$?.formEvent.date_time_start?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.date_time_start?.[0]" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="date_time_end" :label="$t('bookings.formEvent.information.dateTimeEnd')" />
                            <FormDateTimeField id="date_time_end" name="date_time_end"
                                :placeholder="`${$t('bookings.formEvent.information.dateTimeEnd')}`"
                                v-model="state.formEvent.date_time_end" />
                            <FormError :error="v$?.formEvent.date_time_end?.$errors[0]?.$message.toString()" />
                            <FormError :error="state?.error?.errors?.date_time_end?.[0]" />
                        </div>
                    </div>
                    <div>
                        <Tooltip :text="$t('bookings.formEvent.information.createMultipleEvents')" position="left"
                            class="mt-7">
                            <button type="button" @click="state.formEvent.is_recurring = !state.formEvent.is_recurring">
                                <Icon name="ph:repeat" class="h-6 w-6" aria-hidden="true" />
                            </button>
                        </Tooltip>
                    </div>
                </div>
                <div class="block md:flex items-center space-y-2 gap-x-2 py-2">
                    <div class="w-fit flex items-center cursor-pointer"
                        @click="state.formEvent.exclude_weekend = !state.formEvent.exclude_weekend">
                        <FormCheckbox id="change_password" :value="state.formEvent.exclude_weekend" />
                        <span class="text-sm text-gray-600">{{ $t('bookings.formEvent.slots.excludeWeekend') }}</span>
                    </div>
                </div>
                <div class="block md:flex items-center space-y-2 gap-x-2 py-2" v-if="state.formEvent.is_recurring">
                    <p>
                        {{ $t('bookings.formEvent.information.createThisEvent') }}
                    </p>
                    <div class="space-y-1 grow">
                        <FormSelect id="recurring" :options="state.options.recurringSchedules"
                            v-model="state.formEvent.recurring" />
                        <FormError :error="v$?.formEvent?.recurring?.$errors[0]?.$message.toString()" />
                        <FormError :error="state?.error?.errors?.recurring_uuid?.[0]" />
                    </div>
                    <p>
                        {{ $t('recurring.until') }}
                    </p>
                    <div>
                        <FormDateField id="recurring_until" name="recurring_until"
                            :placeholder="`${$t('recurring.until')}`" v-model="state.formEvent.recurring_until" />
                        <FormError :error="v$?.formEvent.recurring_until?.$errors[0]?.$message.toString()" />
                        <FormError :error="state?.error?.errors?.recurring_until?.[0]" />
                    </div>
                </div>
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
                    <div class="md:col-span-3 space-y-3">
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
                <div class="space-y-1">
                    <FormButton type="button" buttonStyle="cancel" class="col-start-2 rounded-md" @click="addSlot()">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('bookings.formEvent.slots.addSlot') }}
                    </FormButton>
                </div>
                <div class="space-y-1">
                    <FormError :error="state?.error?.errors?.slots?.[0]" />
                </div>
                <div class="max-h-96 overflow-y-auto pr-3 space-y-3">
                    <div v-for="(item, idx) in state.formEvent.slots">
                        <div class="grow grid grid-cols-1 md:grid-cols-[1fr_1fr_150px_30px] items-center gap-3">
                            <div class="space-y-1">
                                <FormLabel :for="`start_time_${idx}`"
                                    :label="$t('bookings.formEvent.slots.startTime')" />
                                <FormTimeField :id="`start_time_${idx}`" :name="`start_time_${idx}`"
                                    :placeholder="$t('bookings.formEvent.slots.startTime')" v-model="item.start_time"
                                    class="border border-primary placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-700 focus:border-primary-700 focus:z-10 sm:text-sm" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel :for="`end_time_${idx}`" :label="$t('bookings.formEvent.slots.endTime')" />
                                <FormTimeField :id="`end_time_${idx}`" :name="`end_time_${idx}`"
                                    :placeholder="$t('bookings.formEvent.slots.endTime')" v-model="item.end_time"
                                    class="border border-primary placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-700 focus:border-primary-700 focus:z-10 sm:text-sm" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel :for="`capacity_${idx}`" :label="$t('bookings.formEvent.slots.capacity')" />
                                <FormNumberField :id="`capacity_${idx}`" :name="`capacity_${idx}`"
                                    :placeholder="$t('bookings.formEvent.slots.capacity')" v-model="item.capacity"
                                    class="border border-primary placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-700 focus:border-primary-700 focus:z-10 sm:text-sm" />
                            </div>
                            <div v-if="state.formEvent.slots.length > 1" class="space-y-1">
                                <Tooltip :text="$t('bookings.formEvent.slots.removeSlot')" position="left" class="mt-7">
                                    <button type="button" @click="removeSlot(idx)">
                                        <Icon name="ph:trash" class="h-6 w-6 text-red-700 hover:text-red-600"
                                            aria-hidden="true" />
                                    </button>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                    <div class="space-y-1">
                        <FormError :error="state?.error?.errors?.time_slots?.[0]" />
                    </div>
                </div>
            </div>
            <div class="space-y-3" v-if="state.currentStep === 3">
                <div class="space-y-1">
                    <div class="flex justify-between items-center py-0.5">
                        <FormLabel for="schedule_tag_uuid" :label="$t('dutySchedules.form.tags')" />
                        <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                            @click="state.modal.isAddNewBookingTag = true">
                            {{ $t('bookingTags.addNewBookingTag') }}
                        </span>
                    </div>
                    <FormSelectMultiple id="schedule_tag_uuid" name="schedule_tag_uuid"
                        :options="state.options.bookingTags" v-model="state.formEvent.tags" />
                    <FormError :error="v$?.formEvent?.schedule_tag_uuid?.$errors[0]?.$message.toString()" />
                    <FormError :error="state?.error?.errors?.schedule_tag_uuid?.[0]" />
                </div>
                <div class="flex items-center gap-x-5">
                    <div class="grow space-y-1">
                        <FormLabel for="price" :label="$t('bookings.formEvent.settings.price')" />
                        <FormTextField id="price" name="price" :placeholder="$t('bookings.formEvent.settings.price')"
                            v-model="state.formEvent.price" />
                        <FormError :error="v$?.formEvent?.price?.$errors[0]?.$message.toString()" />
                        <FormError :error="state?.error?.errors?.price?.[0]" />
                    </div>
                    <div class="mt-6 flex items-center">
                        <div class="space-y-1 flex items-center gap-x-2">
                            <FormSwitch :value="state.formEvent.is_tax_included"
                                @toggleSwitch="state.formEvent.is_tax_included = !state.formEvent.is_tax_included" />
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
            <div class="space-y-3" v-if="state.currentStep === 4">
                <Alert type="success" :text="`${t('bookings.alert.eventSuccessfullyAdded')}.`"
                    v-if="props.formType === 'create'" />
                <Alert type="success" :text="`${t('bookings.alert.eventSuccessfullyUpdated')}.`" v-else />
                <div>
                    <p class="text-gray-600">
                        {{ $t('bookings.formCourse.summary.signupForTheEventOnThisAddress') }}:
                    </p>
                    <div class="text-secondary underline cursor-pointer"
                        @click="navigateToExternalLink(`${runtimeConfig.public.appBaseURL}/booking/${state.bookingSettings?.link}/event/${props.eventData?.uuid}`)">
                        {{ runtimeConfig.public.appBaseURL }}/booking/{{ state.bookingSettings?.link }}/event/{{
                            props.eventData?.uuid }}
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
            <div class="mt-6">
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
                        v-if="state.currentStep > 1">
                        {{ $t('back') }}
                    </FormButton>
                    <FormButton type="submit" buttonStyle="primary" class="rounded-md" @click="handleNext()"
                        v-if="state.currentStep >= 1">
                        {{ $t('next') }}
                    </FormButton>
                    <FormButton type="submit" buttonStyle="primary" class="rounded-md" v-if="state.currentStep === 4">
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
    selectedEvent: {
        type: Object,
        required: true,
    },
    eventData: {
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
    formEvent: {
        date_time_start: props.selectedEvent.date_time_start,
        date_time_end: props.selectedEvent.date_time_end,
        is_recurring: false,
        recurring: '',
        recurring_until: props.selectedEvent.date_time_end,
        name: '',
        description: '',
        address: '',
        post_code: '',
        city: '',
        image: '',
        slots: <any>[],
        spots: props.selectedEvent.spots || '0',
        tags: [],
        price: '',
        is_tax_included: false,
        show_spots_left: false,
        close_registration: false,
        is_online_booking: false,
        is_reminder_enabled: false,
        exclude_weekend: false
    },
    isPageLoading: false,
    modal: {
        isAddNewBookingTag: false,
    },
    options: {
        bookingTags: [],
        recurringSchedules: [
            { value: 'everyday', label: `${t('recurring.everyDay')}` },
            { value: 'every_week', label: `${t('recurring.everyWeek')}` },
            { value: 'every_second_week', label: `${t('recurring.everySecondWeek')}` },
            { value: 'every_third_week', label: `${t('recurring.everyThirdWeek')}` },
            { value: 'every_fourth_week', label: `${t('recurring.everyFourthWeek')}` },
            { value: 'every_month', label: `${t('recurring.everyMonth')}` },
        ]
    },
    steps: [
        { id: '01', name: 'Information', href: '#', status: 'current' },
        { id: '02', name: 'Slots', href: '#', status: 'upcoming' },
        { id: '03', name: 'Settings', href: '#', status: 'upcoming' },
        { id: '04', name: 'Summary', href: '#', status: 'upcoming' },
    ],
})

watch(() => props.selectedEvent, (selectedEvent: any) => {
    if (selectedEvent) {
        state.formEvent = {
            date_time_start: selectedEvent?.date_time_start,
            date_time_end: selectedEvent?.date_time_end,
            is_recurring: selectedEvent?.is_recurring,
            recurring: selectedEvent?.recurring,
            recurring_until: selectedEvent?.recurring_until,
            name: selectedEvent?.name,
            description: selectedEvent?.description,
            address: selectedEvent?.address,
            post_code: selectedEvent?.post_code,
            city: selectedEvent?.city,
            image: '',
            spots: selectedEvent?.spots,
            slots: formatExistingTimeSlots(selectedEvent?.slots),
            tags: selectedEvent?.tags,
            price: selectedEvent?.price,
            is_tax_included: selectedEvent?.is_tax_included,
            show_spots_left: selectedEvent?.show_spots_left,
            close_registration: selectedEvent?.close_registration,
            is_online_booking: selectedEvent?.is_online_booking,
            is_reminder_enabled: selectedEvent?.is_reminder_enabled,
            exclude_weekend: selectedEvent?.exclude_weekend || false,
        }
        avatarUrl.value = selectedEvent?.image ? selectedEvent?.image : `/img/icons/asset-02.svg`
    }
})

watch(() => props.eventData, (eventData: object) => {
    if (eventData) {
        handleNext()
    }
})

onMounted(() => {
    fetchBookingSettings()
    fetchAllBookingTags()
})

const rules = computed(() => {
    return {
        formEvent: {
            date_time_start: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            date_time_end: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
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
            { id: '02', name: 'Slots', href: '#', status: 'upcoming' },
            { id: '03', name: 'Settings', href: '#', status: 'upcoming' },
            { id: '04', name: 'Summary', href: '#', status: 'upcoming' },
        ]
    }
    if (state.currentStep === 3) {
        state.currentStep = 2
        state.steps = [
            { id: '01', name: 'Information', href: '#', status: 'completed' },
            { id: '02', name: 'Slots', href: '#', status: 'current' },
            { id: '03', name: 'Settings', href: '#', status: 'upcoming' },
            { id: '04', name: 'Summary', href: '#', status: 'upcoming' },
        ]
    }
    if (state.currentStep === 4) {
        state.currentStep = 3
        state.steps = [
            { id: '01', name: 'Information', href: '#', status: 'completed' },
            { id: '02', name: 'Slots', href: '#', status: 'completed' },
            { id: '03', name: 'Settings', href: '#', status: 'current' },
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
                { id: '02', name: 'Slots', href: '#', status: 'current' },
                { id: '03', name: 'Settings', href: '#', status: 'upcoming' },
                { id: '04', name: 'Summary', href: '#', status: 'upcoming' },
            ]
        }
    }
    else if (state.currentStep === 2 && validateSlots() && validateTimeSlots()) {
        state.currentStep = 3
        state.steps = [
            { id: '01', name: 'Information', href: '#', status: 'completed' },
            { id: '02', name: 'Slots', href: '#', status: 'completed' },
            { id: '03', name: 'Settings', href: '#', status: 'current' },
            { id: '04', name: 'Summary', href: '#', status: 'upcoming' },
        ]
    }
    else if (state.currentStep === 3 && Object.keys(props.eventData)?.length === 0) {
        submitForm()
    }
    else if (state.currentStep === 3 && Object.keys(props.eventData)?.length > 0) {
        state.currentStep = 4
        state.steps = [
            { id: '01', name: 'Information', href: '#', status: 'completed' },
            { id: '02', name: 'Slots', href: '#', status: 'completed' },
            { id: '03', name: 'Settings', href: '#', status: 'completed' },
            { id: '04', name: 'Summary', href: '#', status: 'current' },
        ]
    }
}

function addMinutesToTime(time: string, minsToAdd: number) {
    const [hours, minutes] = time.split(":").map(Number)
    const date = new Date()
    date.setHours(hours)
    date.setMinutes(minutes + minsToAdd)
    const newHours = String(date.getHours()).padStart(2, "0")
    const newMinutes = String(date.getMinutes()).padStart(2, "0")
    return `${newHours}:${newMinutes}`
}

function formatExistingTimeSlots(data: any) {
    const slots = data

    const uniqueSlots = []
    const seen = new Set()

    for (const slot of slots) {
        const key = `${slot.start_time}-${slot.end_time}-${slot.capacity}`
        if (!seen.has(key)) {
            seen.add(key)
            uniqueSlots.push({
                start_time: slot.start_time,
                end_time: slot.end_time,
                capacity: slot.capacity
            })
        }
    }
    return uniqueSlots
}

function addSlot() {
    if (!validateTimeSlots()) return
    const slots = state.formEvent.slots
    const lastSlot = slots[slots.length - 1]

    let start = "06:00"
    let end = "06:30"

    if (lastSlot) {
        // Use the previous slot's end_time as the next start
        start = lastSlot.end_time
        end = addMinutesToTime(start, 30) // adds 30 minutes
    }

    slots.push({
        start_time: start,
        end_time: end,
        capacity: 1,
    })
}

function removeSlot(idx: number) {
    if (state.formEvent.slots.length === 1) return
    state.formEvent.slots.splice(idx, 1)
}

watch(() => state.formEvent.slots, (newSlots) => {
    // Update total spots to total number of slot capacity
    state.formEvent.spots = newSlots.reduce((total: any, slot: any) => {
        return total + Number(slot.capacity || 0)
    }, 0)
    validateSlots()
    validateTimeSlots()
}, { deep: true, })

function validateSlots() {
    let error = ''
    if (!state.formEvent.slots.length) {
        error = t('bookings.formEvent.slots.validationError')
    } else if (state.formEvent.spots < 1) {
        error = t('bookings.formEvent.slots.validationError')
    }
    if (!error) return true;

    state.error = {
        message: t('bookings.formEvent.slots.validationError'),
        errors: {
            slots: [error],
        }
    }
    return error === ''
}

function validateTimeSlots() {
    let error = ''
    for (const slot of state.formEvent.slots) {
        if (slot.start_time && slot.end_time) {
            const start = new Date(`1970-01-01T${slot.start_time}`);
            const end = new Date(`1970-01-01T${slot.end_time}`);

            if (start >= end) {
                error = 'Start time must be before end time';
                break
            } else {
                error = '';
            }
        }
    }
    state.error = {
        message: t('bookings.formEvent.slots.validationError'),
        errors: {
            time_slots: [error],
        }
    }
    return error === ''
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
    input.value = input.value.replace(/[^0-9]/g, '').slice(0, 10)
    if (input.value === '0') {
        input.value = '1'
    }
    state.formEvent.spots = input.value
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
            emit('submitForm', state.formEvent)
        }
    }
}
</script>