<template>

    <Head>
        <Title>
            {{ $t('dutySchedules.shareDutySchedule.dutySchedule') }} - {{ runtimeConfig?.public?.appName }}
        </Title>
    </Head>

    <LoadingSpinner :isActive="state.isPageLoading">
        <div
            class="bg-[#f5fafe] relative overflow-clip flex min-h-screen flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
            <img src="/img/icons/asset-01.svg" alt="Image failed to load"
                class="w-52 md:w-1/5 absolute -top-28 -right-24 opacity-0 transition-opacity duration-500"
                id="animatedAsset01">
            <img src="/img/icons/asset-02.svg" alt="Image failed to load"
                class="w-52 md:w-1/4 absolute -bottom-48 -left-44 opacity-0 transition-opacity duration-500"
                id="animatedAsset02">
            <div class="px-4 md:px-0 sm:mx-auto sm:w-full sm:max-w-3xl relative">
                <Logo @click="navigateTo('/')" class="mx-auto" />
                <button type="button" class="-m-2.5 rounded-full w-8 absolute right-5 top-1.5" @click="selectLanguage">
                    <img :src="identifyFlag()" alt="flag">
                </button>
            </div>

            <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-3xl">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <div class="mt-5 md:bg-white md:shadow-sm sm:rounded-lg" v-if="!state.showDutySchedule">
                    <form class="mt-5 px-6 py-3 sm:px-12 md:py-8" method="POST" @submit.prevent="fetchDutySchedule">
                        <div class="space-y-3">
                            <h3 class="font-medium text-lg md:text-xl">
                                {{ $t('dutySchedules.shareDutySchedule.form.unlockDutySchedule') }}
                            </h3>
                            <div class="space-y-1">
                                <FormLabel for="password"
                                    :label="$t('dutySchedules.shareDutySchedule.form.password')" />
                                <FormTextField id="password" name="password"
                                    :placeholder="$t('dutySchedules.shareDutySchedule.form.password')"
                                    v-model="state.formSecuredDutySchedule.password" />
                                <FormError
                                    :error="v$?.formSecuredDutySchedule?.password?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.password?.[0]" />
                            </div>
                        </div>
                        <div class="mt-6">
                            <FormButton type="submit" buttonStyle="primary" class="w-full">
                                {{ $t('dutySchedules.shareDutySchedule.form.unlock') }}
                            </FormButton>
                        </div>
                    </form>
                </div>
                <div v-else class="space-y-5">
                    <header class="grid grid-cols-1 xl:grid-cols-3 gap-3 py-3">
                        <div class="space-y-2">
                            <div class="flex items-center">
                                <div class="relative flex items-center rounded-md bg-white shadow-sm md:items-stretch">
                                    <button @click="!isPreviousWeekDisabled() && previousWeek()" type="button" :class="[
                                        isPreviousWeekDisabled() && 'cursor-not-allowed',
                                        'flex h-11 w-12 items-center justify-center rounded-l-md border-y border-l border-gray-300 pr-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pr-0 md:hover:bg-gray-50'
                                    ]" :disabled="isPreviousWeekDisabled()">
                                        <span class="sr-only">Previous week</span>
                                        <Icon name="heroicons:chevron-left" class="h-5 w-5" aria-hidden="true" />
                                    </button>
                                    <FormDateField id="date" name="date" :placeholder="$t('dutySchedules.form.date')"
                                        :disablePreviousWeeks="true" dateType="duty-schedule"
                                        v-model="state.selectedDate" />
                                    <span class="relative -mx-px h-5 w-px bg-gray-300 md:hidden" />
                                    <button @click="nextWeek()" type="button"
                                        class="flex h-11 w-12 items-center justify-center rounded-r-md border-y border-r border-gray-300 pl-1 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:pl-0 md:hover:bg-gray-50">
                                        <span class="sr-only">Next week</span>
                                        <Icon name="heroicons:chevron-right" class="h-5 w-5" aria-hidden="true" />
                                    </button>
                                </div>
                            </div>
                            <button @click="setToday()" class="text-primary text-sm hover:text-primary-700">
                                {{ $t('goToToday') }}
                            </button>
                        </div>
                    </header>
                    {{ state.schedules?.data }}
                    <Pagination :data="state.schedules" @previous="previous" @next="next" />
                </div>
            </div>
        </div>
        <ModulesUserLanguageSlideOver :isOpen="state.slideOver.isLanguageSwitcherOpen"
            @close="state.slideOver.isLanguageSwitcherOpen = false" />
    </LoadingSpinner>
</template>

<script setup lang="ts">
import moment from 'moment'
import { dutyScheduleService } from '@/components/api/guest/DutyScheduleService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useUserStore } from '@/store/user'
import { useI18n } from "vue-i18n"
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'

import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore()
const language = useI18n()
const { formatDateToReadable, formatDateTimeToReadable } = useDatetimeFormatter()
const { t } = useI18n()
const router = useRouter()
const sharedDutyScheduleUuid = router?.currentRoute?.value?.params?.duty_schedules_uuid
let currentTablePage = 1

// Set language
language.locale.value = userStore.getLanguage

const state = reactive({
    error: {} as Error,
    formSecuredDutySchedule: {
        password: '',
    },
    isPageLoading: false,
    schedules: [] as any,
    selectedDate: moment().format('YYYY-MM-DD'),
    showDutySchedule: false,
    slideOver: {
        isLanguageSwitcherOpen: false
    },
})

const rules = computed(() => {
    return {
        formSecuredDutySchedule: {
            password: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        }
    }
})
const v$ = useVuelidate(rules, state)

onMounted(() => {
    animateAssets()
})

function animateAssets() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in')
            } else {
                entry.target.classList.remove('animate-fade-in')
            }
        })
    })

    const animatedAsset01 = document.getElementById('animatedAsset01') as any
    const animatedAsset02 = document.getElementById('animatedAsset02') as any
    observer.observe(animatedAsset01)
    observer.observe(animatedAsset02)
}

function selectLanguage() {
    state.slideOver.isLanguageSwitcherOpen = true
}

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

async function fetchDutySchedule() {
    state.error = {}
    v$.value.$validate()
    if (!v$.value.$error) {
        state.isPageLoading = true
        try {
            const dateMoment = moment(state.selectedDate)
            const startOfWeek = dateMoment.clone().startOf('isoWeek')
            const endOfWeek = dateMoment.clone().endOf('isoWeek')
            const startOfWeekFormatted = startOfWeek.format('YYYY-MM-DD')
            const endOfWeekFormatted = endOfWeek.format('YYYY-MM-DD')
            const params = {
                page: currentTablePage,
                password: state.formSecuredDutySchedule.password,
                date_start: startOfWeekFormatted,
                date_end: endOfWeekFormatted,
            }
            const response = await dutyScheduleService.unlockDutySchedule(sharedDutyScheduleUuid, params)
            if (response) {
                state.schedules = response
                state.showDutySchedule = true
            }
        } catch (error: any) {
            state.error = error
        }
        state.isPageLoading = false
    }
}

function previous() {
    currentTablePage--
    fetchDutySchedule()
}

function next() {
    currentTablePage++
    fetchDutySchedule()
}

function isPreviousWeekDisabled() {
    const today = moment().startOf('week')
    const selectedDate = moment(state.selectedDate).startOf('week')
    if (selectedDate.isSame(today, 'week')) {
        return true
    }
}

function previousWeek() {
    state.selectedDate = moment(state.selectedDate).subtract(1, 'week').format('YYYY-MM-DD')
    fetchDutySchedule()
}

function setToday() {
    state.selectedDate = moment(state.selectedDate).format('YYYY-MM-DD')
    fetchDutySchedule()
}

function nextWeek() {
    state.selectedDate = moment(state.selectedDate).add(1, 'week').format('YYYY-MM-DD')
    fetchDutySchedule()
}

watch(() => state.selectedDate, (newSelectedDate: any) => {
    if (newSelectedDate) {
        fetchDutySchedule()
    }
})
</script>