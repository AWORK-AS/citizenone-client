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
            <LoadingSpinner :isActive="state.isPageLoading">
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
                                                <div class="space-y-1">
                                                    <FormLabel for="email"
                                                        :label="$t('bookings.booking.yourDetails.emailAddress')" />
                                                    <FormTextField id="email" name="email"
                                                        :placeholder="$t('bookings.booking.yourDetails.emailAddress')"
                                                        v-model="state.formBooking.email" />
                                                    <FormError
                                                        :error="v$?.formBooking?.email?.$errors[0]?.$message.toString()" />
                                                    <FormError :error="state?.error?.errors?.email?.[0]" />
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
                            <div v-if="state.currentStep === 3">
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
                                                <!-- <p class="font-semibold text-right text-primary">
                                                    {{ $t('bookings.booking.confirmation.time') }}
                                                </p>
                                                <p class="col-span-3">
                                                    Friday d. 20 June 2025, 9:00 to Sunday d. 29 June 2025, 17:00
                                                    (GMT+02:00)
                                                </p> -->
                                                <p class="font-semibold text-right text-primary">
                                                    {{ $t('bookings.booking.confirmation.price') }}
                                                </p>
                                                <p class="col-span-3">
                                                    {{ formatAmount(state?.courseEventDetails?.price) }}
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
                                <div class="p-6">
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
            </LoadingSpinner>
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
import { onlineBookingSettingsService } from '@/components/api/user/OnlineBookingSettingsService'
import { onlineBookingService } from '@/components/api/user/OnlineBookingService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import { useUserStore } from '@/store/user'
import { useAmountFormatter } from '@/composables/amountFormatter'
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
    },
    isPageLoading: false,
    slideOver: {
        isLanguageSwitcherOpen: false
    },
    successfullyBooked: false,
})

const rules = computed(() => {
    return {
        formBooking: {
            firstname: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            lastname: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            email: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
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
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
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
