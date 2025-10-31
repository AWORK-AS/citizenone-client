<template>
    <div class="min-h-screen flex flex-col">
        <header class="bg-primary">
            <div class="mx-auto max-w-6xl px-4 py-8 flex justify-between gap-x-5">
                <div>
                    <div class="flex items-center gap-x-4 cursor-pointer"
                        @click="navigateTo(`/booking/${state.bookingSettings?.link}/overview`)"
                        v-if="Object.keys(state.bookingSettings).length > 0">
                        <p class="text-xl text-white font-semibold">
                            {{ state.bookingSettings?.header }}
                        </p>
                        <div class="bg-white px-3 py-2 text-xs font-semibold rounded-lg">
                            {{ $t('bookings.events') }}
                        </div>
                    </div>
                </div>
                <button type="button" class="-m-2.5 rounded-full w-8" @click="selectLanguage">
                    <img :src="identifyFlag()" alt="flag">
                </button>
            </div>
        </header>
        <div class="flex-grow">
            <div class="mx-auto max-w-6xl text-center px-4 py-40 space-y-5" v-if="state.isPageLoading">
                <div class="flex justify-center items-center">
                    <img src="/img/undraw/warning.svg" class="w-48 cursor-pointer" />
                </div>
                <div>
                    <h2 class="text-balance text-2xl font-semibold tracking-tight text-gray-900">
                        {{ $t('bookings.loading.loadingEventDetails') }}.
                    </h2>
                    <p class="text-pretty text-lg text-gray-600">
                        {{ $t('bookings.loading.theSystemIsRetrievening') }}
                        <span class="dot1">.</span>
                        <span class="dot2">.</span>
                        <span class="dot3">.</span>
                        <span class="dot4">.</span>
                        <span class="dot5">.</span>
                    </p>
                </div>
            </div>
            <div v-else>
                <div class="mx-auto max-w-6xl px-4 py-8" v-if="Object.keys(state.bookingSettings).length > 0">
                    <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                        :to="`/booking/${companyLink}/overview`">
                        <Icon name="ph:arrow-left" size="20" class="text-black" />
                        <span>{{ $t('back') }}</span>
                    </NuxtLink>

                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <ModulesUserBookingProgress :currentStep="state.currentStep" />
                    <div class="mt-10 grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-5">
                        <div class="md:col-span-2">
                            <div v-if="state.currentStep === 1">
                                <ModulesUserBookingCourseEventDetails :courseEventDetails="state.courseEventDetails"
                                    @continue="handleNextStep()" />
                            </div>
                            <div v-if="state.currentStep === 2">
                                <div class="relative">
                                    <div class="p-6">
                                        <form>
                                            <div class="grow grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-6">
                                                <div class="w-full">
                                                    <div class="space-y-3 w-[308px]">
                                                        <FormLabel for="date_time_end" :label="$t('bookings.formEvent.appointment.selectDate')" />
                                                        <FormCalendarDatePicker id="selected_date" name="selected_date"
                                                            :placeholder="$t('bookings.formEvent.appointment.dateSelected')"
                                                            :min-date="state.courseEventDetails?.event_course_sessions[0]?.date_time_start.split(' ')[0]"
                                                            :max-date="state.courseEventDetails?.event_course_sessions[0]?.date_time_end.split(' ')[0]"
                                                            v-model="state.selected_date" />
                                                        <FormError :error="''" />
                                                        <FormError :error="''" />
                                                    </div>
                                                </div>
                                                <div class="space-y-1">
                                                    <FormLabel for="select_timeslot" :label="$t('bookings.formEvent.appointment.selectTimeSlot')" />
                                                    <fieldset>
                                                        
                                                        <RadioGroup v-model="state.formBooking.time_slot"
                                                            class="grid grid-cols-1 gap-y-6 sm:grid-cols-1 sm:gap-x-4 max-h-96 overflow-y-auto pl-1 pr-3 py-3 space-y-1">
                                                            
                                                            <div v-if="!state.date_time_slots?.length" class="text-gray-600 font-semibold text-sm mt-4">
                                                                {{ $t('bookings.formEvent.appointment.noSlots') }}
                                                            </div>

                                                            <RadioGroupOption as="template" v-for="timeSlot in state.date_time_slots"
                                                                :key="timeSlot.id" :value="timeSlot" :aria-label="`${timeSlot.start_time} - ${timeSlot.end_time}`"
                                                                v-slot="{ active, checked }" :disabled="timeSlot.capacity < 1">
                                                                <div
                                                                    :class="[active ? 'border-primary ring-1 ring-primary' : 'border-gray-300', 'relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-xs focus:outline-hidden', timeSlot.capacity < 1 ? '!border-gray-300 !bg-gray-100 !text-gray-400' : 'text-gray-900']">
                                                                    <span class="flex flex-1">  
                                                                        <span class="flex flex-col">
                                                                            <p class="w-full block text-sm font-medium ">
                                                                                <span>
                                                                                    {{ `${timeSlot.start_time} - ${timeSlot.end_time}` }}
                                                                                </span>
                                                                            </p>
                                                                        </span>
                                                                    </span>
                                                                    <Icon name="ph:check-circle"
                                                                        :class="[!checked ? 'invisible' : '', 'size-5 text-primary']"
                                                                        aria-hidden="true" />
                                                                    <span v-if="timeSlot.capacity < 1" class="text-red-500 text-sm font-medium">
                                                                        {{ $t('bookings.formEvent.appointment.full') }}
                                                                    </span>
                                                                    <span
                                                                        :class="[active ? 'border' : 'border-1', checked ? 'border-primary' : 'border-transparent', 'pointer-events-none absolute -inset-px rounded-lg']"
                                                                        aria-hidden="true" />
                                                                </div>
                                                            </RadioGroupOption>
                                                        </RadioGroup>
                                                    </fieldset>
                                                </div>
                                            </div>
                                            <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                                                    @click="handleBackStep()">
                                                    {{ $t('back') }}
                                                </FormButton>
                                                <FormButton type="button" buttonStyle="primary"
                                                    class="rounded-md w-full" @click="handleNextStep()">
                                                    {{ $t('next') }}
                                                </FormButton>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                            <div v-if="state.currentStep === 3">
                                <div class="relative">
                                    <div class="p-6">
                                        <form @submit.prevent="submitForm()">
                                            <div class="space-y-3">
                                                <p class="text-lg font-medium tracking-tight">
                                                    {{ $t('bookings.booking.yourDetails.yourDetails') }}
                                                </p>
                                                <div class="space-y-1">
                                                    <FormLabel for="firstname"
                                                        :label="$t('bookings.booking.yourDetails.firstname')" />
                                                    <FormTextField id="firstname" name="firstname"
                                                        :placeholder="$t('bookings.booking.yourDetails.firstname')"
                                                        v-model="state.formBooking.firstname" />
                                                    <FormError
                                                        :error="v$?.formBooking?.firstname?.$errors[0]?.$message.toString()" />
                                                    <FormError :error="state?.error?.errors?.firstname?.[0]" />
                                                </div>
                                                <div class="space-y-1">
                                                    <FormLabel for="lastname"
                                                        :label="$t('bookings.booking.yourDetails.lastname')" />
                                                    <FormTextField id="lastname" name="lastname"
                                                        :placeholder="$t('bookings.booking.yourDetails.lastname')"
                                                        v-model="state.formBooking.lastname" />
                                                    <FormError
                                                        :error="v$?.formBooking?.lastname?.$errors[0]?.$message.toString()" />
                                                    <FormError :error="state?.error?.errors?.lastname?.[0]" />
                                                </div>
                                                <div class="space-y-1"
                                                    v-if="JSON.parse(state.bookingSettings?.fields)?.email?.enabled">
                                                    <FormLabel for="email"
                                                        :label="$t('bookings.booking.yourDetails.emailAddress')" />
                                                    <FormTextField id="email" name="email"
                                                        :placeholder="$t('bookings.booking.yourDetails.emailAddress')"
                                                        v-model="state.formBooking.email" />
                                                    <FormError
                                                        :error="v$?.formBooking?.email?.$errors[0]?.$message.toString()" />
                                                    <FormError :error="state?.error?.errors?.email?.[0]" />
                                                </div>
                                                <div class="space-y-1"
                                                    v-if="JSON.parse(state.bookingSettings?.fields)?.phone?.enabled">
                                                    <FormLabel for="phone"
                                                        :label="$t('bookings.booking.yourDetails.phone')" />
                                                    <FormTextField id="phone" name="phone"
                                                        :placeholder="$t('bookings.booking.yourDetails.phone')"
                                                        v-model="state.formBooking.phone" />
                                                    <FormError
                                                        :error="v$?.formBooking?.phone?.$errors[0]?.$message.toString()" />
                                                    <FormError :error="state?.error?.errors?.phone?.[0]" />
                                                </div>
                                                <div class="space-y-1"
                                                    v-if="JSON.parse(state.bookingSettings?.fields)?.address?.enabled">
                                                    <FormLabel for="address"
                                                        :label="$t('bookings.booking.yourDetails.address')" />
                                                    <FormTextField id="address" name="address"
                                                        :placeholder="$t('bookings.booking.yourDetails.address')"
                                                        v-model="state.formBooking.address" />
                                                    <FormError
                                                        :error="v$?.formBooking?.address?.$errors[0]?.$message.toString()" />
                                                    <FormError :error="state?.error?.errors?.address?.[0]" />
                                                </div>
                                                <div class="space-y-1"
                                                    v-if="JSON.parse(state.bookingSettings?.fields)?.notes?.enabled">
                                                    <FormLabel for="notes"
                                                        :label="$t('bookings.booking.yourDetails.notes')" />
                                                    <FormTextField id="notes" name="notes"
                                                        :placeholder="$t('bookings.booking.yourDetails.notes')"
                                                        v-model="state.formBooking.notes" />
                                                    <FormError
                                                        :error="v$?.formBooking?.notes?.$errors[0]?.$message.toString()" />
                                                    <FormError :error="state?.error?.errors?.notes?.[0]" />
                                                </div>
                                                <div class="space-y-1"
                                                    v-if="JSON.parse(state.bookingSettings?.fields)?.social_security_number?.enabled">
                                                    <FormLabel for="social_security_number"
                                                        :label="$t('bookings.booking.yourDetails.socialSecurityNumber')" />
                                                    <FormTextField id="social_security_number"
                                                        name="social_security_number"
                                                        :placeholder="$t('bookings.booking.yourDetails.socialSecurityNumber')"
                                                        v-model="state.formBooking.social_security_number" />
                                                    <FormError
                                                        :error="v$?.formBooking?.social_security_number?.$errors[0]?.$message.toString()" />
                                                    <FormError
                                                        :error="state?.error?.errors?.social_security_number?.[0]" />
                                                </div>
                                                <div class="space-y-1"
                                                    v-if="JSON.parse(state.bookingSettings?.fields)?.date_of_birth?.enabled">
                                                    <FormLabel for="date_of_birth"
                                                        :label="$t('bookings.booking.yourDetails.dateOfBirth')" />
                                                    <FormDateField id="date_of_birth" name="date_of_birth"
                                                        :placeholder="$t('bookings.booking.yourDetails.dateOfBirth')"
                                                        v-model="state.formBooking.date_of_birth" />
                                                    <FormError
                                                        :error="v$?.formBooking?.date_of_birth?.$errors[0]?.$message.toString()" />
                                                    <FormError :error="state?.error?.errors?.date_of_birth?.[0]" />
                                                </div>
                                            </div>
                                            <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                                                    @click="handleBackStep()">
                                                    {{ $t('back') }}
                                                </FormButton>
                                                <FormButton type="submit" buttonStyle="primary"
                                                    class="rounded-md w-full">
                                                    {{ $t('bookings.booking.continueToConfirmation') }}
                                                </FormButton>
                                            </div>
                                        </form>
                                    </div>
                                    <div
                                        class="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5">
                                    </div>
                                </div>
                            </div>
                            <div v-if="state.currentStep === 4">
                                <div v-if="!state.successfullyBooked">
                                    <div class="relative">
                                        <div class="p-6">
                                            <p class="text-lg font-medium tracking-tight">
                                                {{ $t('bookings.booking.confirmation.confirmation') }}
                                            </p>
                                            <div class="mt-6 grid grid-cols-4 gap-x-5 gap-y-3">
                                                <p class="font-semibold text-right text-primary">
                                                    <span v-if="state.courseEventDetails?.type === 'event'">
                                                        {{ $t('bookings.booking.confirmation.eventName') }}
                                                    </span>
                                                    <span v-else>
                                                        {{ $t('bookings.booking.confirmation.courseName') }}
                                                    </span>
                                                </p>
                                                <p class="col-span-3">
                                                    {{ state.courseEventDetails?.name }}
                                                </p>
                                                <p class="font-semibold text-right text-primary">
                                                    {{ $t('bookings.booking.confirmation.price') }}
                                                </p>
                                                <p class="col-span-3">
                                                    {{
                                                        formatAmount(state?.courseEventDetails?.booking_setting?.price)
                                                    }}
                                                </p>
                                                <p class="font-semibold text-right text-primary">
                                                    {{ $t('bookings.booking.confirmation.information') }}
                                                </p>
                                                <div class="col-span-3">
                                                    <p>
                                                        {{ state.formBooking.firstname + ' ' +
                                                            state.formBooking.lastname }}
                                                    </p>
                                                    <p>
                                                        {{ state.formBooking.email }}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            class="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5">
                                        </div>
                                    </div>
                                    <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <FormButton type="button" buttonStyle="cancel" class="rounded-md"
                                            @click="handleBackStep()">
                                            {{ $t('back') }}
                                        </FormButton>
                                        <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full"
                                            @click="signUpForCourseEvent()"
                                            v-if="state.courseEventDetails?.type === 'event'">
                                            {{ $t('bookings.booking.signUpForEvent') }}
                                        </FormButton>
                                        <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full"
                                            @click="signUpForCourseEvent()" v-else>
                                            {{ $t('bookings.booking.signUpForCourse') }}
                                        </FormButton>
                                    </div>
                                </div>
                                <div v-else>
                                    <div class="relative">
                                        <div class="p-6">
                                            <div
                                                class="mx-auto max-w-fit bg-secondary rounded-full p-4 flex items-center justify-center">
                                                <Icon name="ph:check-bold" class="h-7 w-7 text-white"
                                                    aria-hidden="true" />
                                            </div>
                                            <div class="mt-4 text-center">
                                                <h2 class="text-3xl font-extrabold text-gray-900">
                                                    <span v-if="state.courseEventDetails?.type === 'event'">
                                                        {{
                                                            $t('bookings.booking.confirmation.youHaveSignedUpForTheEvent')
                                                        }}
                                                    </span>
                                                    <span v-else>
                                                        {{
                                                            $t('bookings.booking.confirmation.youHaveSignedUpForTheCourse')
                                                        }}
                                                    </span>
                                                    <p v-if="state.courseEventDetails?.name">
                                                        {{ state.courseEventDetails?.name }}.
                                                    </p>
                                                </h2>
                                            </div>
                                            <div class="mt-8">
                                                <FormButton buttonStyle="primary" class="w-full"
                                                    @click="navigateTo(`/booking/${companyLink}/overview`)">
                                                    {{ $t('bookings.booking.confirmation.goToOverview') }}
                                                </FormButton>
                                            </div>
                                        </div>
                                        <div
                                            class="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div class="relative">
                                <div class="p-6 space-y-2">
                                    <div class="flex items-center gap-x-2">
                                        <Icon name="ph:phone" class="h-5 w-5" aria-hidden="true" />
                                        <p class="text-muted-400" v-if="state.bookingSettings?.is_phone_enabled">
                                            {{ state.bookingSettings?.company?.phone }}
                                        </p>
                                    </div>
                                    <div class="flex gap-x-2">
                                        <Icon name="ph:map-pin" class="h-5 w-5" aria-hidden="true" />
                                        <p class="text-muted-400" v-if="state.bookingSettings?.is_address_enabled">
                                            {{ state.bookingSettings?.company?.company_address?.street }}
                                            {{ state.bookingSettings?.company?.company_address?.region?.name }}
                                            {{ state.bookingSettings?.company?.company_address?.municipality?.name }}
                                            {{ state.bookingSettings?.company?.company_address?.city }}
                                            {{ state.bookingSettings?.company?.company_address?.post_code }}
                                        </p>
                                    </div>
                                    <p class="text-sm text-muted-400">
                                        <div v-html="state.bookingSettings?.description" class="content" />
                                    </p>
                                </div>
                                <div
                                    class="pointer-events-none absolute inset-px rounded-lg shadow ring-1 ring-black/5">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mx-auto max-w-6xl text-center px-4 py-40 space-y-5" v-else>
                    <div class="flex justify-center items-center">
                        <img src="/img/undraw/warning.svg" class="w-48 cursor-pointer" />
                    </div>
                    <div>
                        <h2 class="text-balance text-2xl font-semibold tracking-tight text-gray-900">
                            Opppps! {{ $t('somethingWentWrong') }}.
                        </h2>
                        <p class="text-pretty text-lg text-gray-600">
                            {{ $t('pageNotFound') }}.
                        </p>
                    </div>
                    <div class="mx-auto max-w-xs">
                        <FormButton buttonStyle="primary" class="w-full" @click="navigateTo('/')">
                            {{ $t('home') }}
                        </FormButton>
                    </div>
                </div>
            </div>
        </div>
        <footer class="bg-gray-50">
            <div class="mx-auto max-w-6xl px-4 py-6">
                <p class="text-gray-600">
                    &copy; {{ new Date().getFullYear() }} {{ runtimeConfig?.public?.appName }}
                </p>
            </div>
        </footer>
        <ModulesUserLanguageSlideOver :isOpen="state.slideOver.isLanguageSwitcherOpen"
            @close="state.slideOver.isLanguageSwitcherOpen = false" />
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { onlineBookingSettingsService } from '@/components/api/user/OnlineBookingSettingsService'
import { onlineBookingService } from '@/components/api/user/OnlineBookingService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import { useUserStore } from '@/store/user'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { RadioGroup, RadioGroupOption } from '@headlessui/vue'
import type { Error } from '@/types'
const router = useRouter()
const companyLink = router?.currentRoute?.value?.params?.company_link
const eventUuid = router?.currentRoute?.value?.params?.event_uuid

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore()
const { formatAmount } = useAmountFormatter()
const { t } = useI18n()

const state = reactive({
    bookingSettings: {} as any,
    courseEventDetails: {} as any,
    currentStep: 1,
    error: {} as Error,
    formBooking: {
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
        social_security_number: '',
        date_of_birth: '',
        time_slot: null as any
    },
    isPageLoading: false,
    slideOver: {
        isLanguageSwitcherOpen: false
    },
    successfullyBooked: false,
    selected_date: '',
    date_time_slots: []
})

const rules = computed(() => {
    const fields = JSON.parse(state.bookingSettings?.fields || '{}')

    return {
        formBooking: {
            firstname: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            lastname: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            email: fields?.email?.required
                ? { required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required) }
                : {},
            phone: fields?.phone?.required
                ? { required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required) }
                : {},
            address: fields?.address?.required
                ? { required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required) }
                : {},
            notes: fields?.notes?.required
                ? { required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required) }
                : {},
            social_security_number: fields?.social_security_number?.required
                ? { required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required) }
                : {},
            date_of_birth: fields?.date_of_birth?.required
                ? { required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required) }
                : {},
        },
    }
})

const v$ = useVuelidate(rules, state)

onMounted(() => {
    fetchBookingSettings()
    fetchCourseEvent()
})

function identifyFlag() {
    const selectedLanguage = userStore.getLanguage
    if (selectedLanguage === 'en') {
        return '/img/icons/flags/united-kingdom.svg'
    } else {
        if (selectedLanguage === 'dk') {
            return '/img/icons/flags/denmark.svg'
        }
    }
}

function selectLanguage() {
    state.slideOver.isLanguageSwitcherOpen = true
}

async function fetchBookingSettings() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await onlineBookingSettingsService.getOnlineBookingSettingsPerLink(companyLink)
        if (response?.data) {
            state.bookingSettings = response?.data
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchCourseEvent() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await onlineBookingService.getCourseEvent(eventUuid)
        if (response?.data) {
            state.courseEventDetails = response?.data
            state.selected_date = moment().format('YYYY-MM-DD')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

watch(() => state.selected_date, () => {
    fetchBookingSlots()
})

async function fetchBookingSlots() {
    state.error = {}
    try {
        const response = await onlineBookingService.getBookingSlots(state.courseEventDetails.booking_setting.uuid, state.selected_date)
        if (response?.data) {
            state.date_time_slots = response?.data
        }
    } catch (error: any) {
        state.error = error
    }
}

function handleBackStep() {
    state.currentStep = state.currentStep - 1
}

function handleNextStep() {
    state.currentStep = state.currentStep + 1
}

function submitForm() {
    v$.value.$validate()
    if (!v$.value.$error) {
        handleNextStep()
    }
}

async function signUpForCourseEvent() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            firstname: state.formBooking.firstname,
            lastname: state.formBooking.lastname,
            email: state.formBooking.email,
            phone: state.formBooking.phone,
            address: state.formBooking.address,
            notes: state.formBooking.notes,
            social_security_number: state.formBooking.social_security_number,
            date_of_birth: state.formBooking.date_of_birth,
            time_slot: state.formBooking.time_slot?.uuid || null
        }
        const response = await onlineBookingService.bookCourseEvent(eventUuid, params)
        if (response.data) {
            state.successfullyBooked = true
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
