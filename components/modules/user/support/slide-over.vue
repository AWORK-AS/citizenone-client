<template>
    <TransitionRoot as="template" :show="props.isOpen">
        <Dialog class="relative z-50" @close="closeSlide">
            <div class="fixed inset-0" />

            <div class="fixed inset-0 overflow-hidden">
                <div class="absolute inset-0 overflow-hidden">
                    <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                        <TransitionChild as="template"
                            enter="transform transition ease-in-out duration-500 sm:duration-600"
                            enter-from="translate-x-full" enter-to="translate-x-0"
                            leave="transform transition ease-in-out duration-500 sm:duration-700"
                            leave-from="translate-x-0" leave-to="translate-x-full">
                            <DialogPanel class="pointer-events-auto w-screen max-w-sm">
                                <div class="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                                    <div class="px-4 sm:px-6">
                                        <div class="flex items-start justify-between">
                                            <DialogTitle class="text-base font-semibold leading-6 text-gray-900">
                                                {{ $t('support.support') }}
                                            </DialogTitle>
                                            <div class="ml-3 flex h-7 items-center">
                                                <button type="button"
                                                    class="relative rounded-md bg-white text-tertiary-800 hover:text-tertiary focus:outline-none"
                                                    @click="closeSlide">
                                                    <span class="absolute -inset-2.5" />
                                                    <span class="sr-only">Close panel</span>
                                                    <Icon name="ph:x" class="h-6 w-6" aria-hidden="true" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="relative mt-10 flex-1 px-4 sm:px-6">
                                        <div>
                                            <div>
                                                <div class="flex gap-x-5">
                                                    <div class="support-mask">
                                                        <img src="https://citizenone.dk/wp-content/uploads/2024/08/CitizenOne-10.jpg"
                                                            alt="Support" class="w-full h-28 object-cover" />
                                                    </div>
                                                    <div>
                                                        <p class="text-xl ">
                                                            {{ $t('support.weAreReadyToHelp') }}
                                                        </p>
                                                        <div class="space-y-2">
                                                            <div class="flex items-center gap-x-1">
                                                                <Icon name="ph:phone" class="h-4 w-4"
                                                                    aria-hidden="true" />
                                                                <span class="text-sm">+45 80 83 01 14</span>
                                                            </div>
                                                            <div class="flex items-center gap-x-1">
                                                                <Icon name="ph:envelope" class="h-4 w-4"
                                                                    aria-hidden="true" />
                                                                <span class="text-sm">support@citizenone.dk</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="-mt-2">
                                                    <FormButton buttonStyle="primary" @click="navigateToSupport()"
                                                        class="w-full">
                                                        {{ $t('support.findGuidesHere') }}
                                                    </FormButton>
                                                </div>
                                                <div class="mt-2">
                                                    <FormButton buttonStyle="primary" @click="toggleChatVisibility()"
                                                        class="w-full">
                                                        {{ $t('support.chatWithSupport') }}
                                                    </FormButton>
                                                </div>
                                                <div class="mt-2">
                                                    <FormButton buttonStyle="primary"
                                                        @click="state.modal.isGuidedTourWelcomeOpen = true"
                                                        class="w-full">
                                                        {{ $t('support.getAGuidedTour') }}
                                                    </FormButton>
                                                </div>
                                            </div>
                                            <hr class="mt-5 mb-4" />
                                            <div class="space-y-5">
                                                <div class="space-y-3">
                                                    <p class="text-xl">
                                                        {{ $t('support.needACourse') }}?
                                                    </p>
                                                    <p class="text-sm">
                                                        {{ $t('support.courseDetails') }}.
                                                    </p>
                                                    <div>
                                                        <FormButton buttonStyle="primary" @click="navigateToCourses()"
                                                            class="w-full">
                                                            {{ $t('support.viewCourses') }}
                                                        </FormButton>
                                                    </div>
                                                </div>
                                            </div>
                                            <hr class="mt-5 mb-4" />
                                            <div class="space-y-5">
                                                <div class="space-y-3">
                                                    <p class="text-xl">
                                                        {{ $t('support.latestNewFeatures') }}
                                                    </p>
                                                    <p class="text-sm">
                                                        {{ $t('support.latestNewFeaturesDetails') }}.
                                                    </p>
                                                    <div>
                                                        <FormButton buttonStyle="primary"
                                                            @click="navigateToLatestFeatures()" class="w-full">
                                                            {{ $t('support.seeTheNewFeatures') }}
                                                        </FormButton>
                                                    </div>
                                                </div>
                                            </div>
                                            <hr class="mt-5 mb-4" />
                                            <div class="space-y-5">
                                                <div class="space-y-3">
                                                    <p class="text-xl">
                                                        {{ $t('support.newFeatureRequest') }}?
                                                    </p>
                                                    <p class="text-sm">
                                                        {{ $t('support.newFeatureRequestDetails') }}.
                                                    </p>
                                                    <div>
                                                        <FormButton buttonStyle="primary"
                                                            @click="state.modal.isContactUsOpen = true" class="w-full">
                                                            {{ $t('support.sendUsYourRequests') }}
                                                        </FormButton>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>



                                <ModulesUserGuidedTourModalWelcome v-if="state.modal.isGuidedTourWelcomeOpen"
                                    :isModalOpen="state.modal.isGuidedTourWelcomeOpen" :isGuidedTour="true"
                                    @close="state.modal.isGuidedTourWelcomeOpen = false" @next="handleNextGuidedTour" />
                                <ModulesUserGuidedTourModalDailyOverview
                                    v-if="state.modal.isGuidedTourDailyOverviewOpen"
                                    :isModalOpen="state.modal.isGuidedTourDailyOverviewOpen" :isGuidedTour="true"
                                    @close="state.modal.isGuidedTourDailyOverviewOpen = false"
                                    @back="handleBackGuidedTour" @next="handleNextGuidedTour" />
                                <ModulesUserGuidedTourModalCitizens v-if="state.modal.isGuidedTourCitizensOverviewOpen"
                                    :isModalOpen="state.modal.isGuidedTourCitizensOverviewOpen" :isGuidedTour="true"
                                    @close="state.modal.isGuidedTourCitizensOverviewOpen = false"
                                    @back="handleBackGuidedTour" @next="handleNextGuidedTour" />
                                <ModulesUserGuidedTourModalCalendar v-if="state.modal.isGuidedTourCalendarOpen"
                                    :isModalOpen="state.modal.isGuidedTourCalendarOpen" :isGuidedTour="true"
                                    @close="state.modal.isGuidedTourCalendarOpen = false" @back="handleBackGuidedTour"
                                    @next="handleNextGuidedTour" />
                                <ModulesUserGuidedTourModalDutySchedule v-if="state.modal.isGuidedTourDutyScheduleOpen"
                                    :isModalOpen="state.modal.isGuidedTourDutyScheduleOpen" :isGuidedTour="true"
                                    @close="state.modal.isGuidedTourDutyScheduleOpen = false"
                                    @back="handleBackGuidedTour" @next="handleNextGuidedTour" />
                                <ModulesUserGuidedTourModalEmployees v-if="state.modal.isGuidedTourEmployeesOpen"
                                    :isModalOpen="state.modal.isGuidedTourEmployeesOpen" :isGuidedTour="true"
                                    @close="state.modal.isGuidedTourEmployeesOpen = false" @back="handleBackGuidedTour"
                                    @next="handleNextGuidedTour" />
                                <ModulesUserGuidedTourModalEnd v-if="state.modal.isGuidedTourEndOpen"
                                    :isModalOpen="state.modal.isGuidedTourEndOpen" :isGuidedTour="true"
                                    @close="state.modal.isGuidedTourEndOpen = false" @back="handleBackGuidedTour"
                                    @next="handleNextGuidedTour" />

                                <ModulesUserWishListModalContactUs :isModalOpen="state.modal.isContactUsOpen"
                                    @close="state.modal.isContactUsOpen = false" v-if="state.modal.isContactUsOpen" />
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'

const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close'])

const state = reactive({
    modal: {
        isContactUsOpen: false,
        isGuidedTourCalendarOpen: false,
        isGuidedTourCitizensOverviewOpen: false,
        isGuidedTourDailyOverviewOpen: false,
        isGuidedTourDutyScheduleOpen: false,
        isGuidedTourEmployeesOpen: false,
        isGuidedTourEndOpen: false,
        isGuidedTourWelcomeOpen: false,
    }
})

function closeSlide() {
    emit('close')
}

function handleBackGuidedTour(back: any) {
    if (back === 'welcome') {
        state.modal.isGuidedTourDailyOverviewOpen = false
        state.modal.isGuidedTourWelcomeOpen = true
    }
    if (back === 'daily-overview') {
        state.modal.isGuidedTourCitizensOverviewOpen = false
        state.modal.isGuidedTourDailyOverviewOpen = true
    }
    if (back === 'citizens-overview') {
        state.modal.isGuidedTourCalendarOpen = false
        state.modal.isGuidedTourCitizensOverviewOpen = true
    }
    if (back === 'calendar') {
        state.modal.isGuidedTourDutyScheduleOpen = false
        state.modal.isGuidedTourCalendarOpen = true
    }
    if (back === 'duty-schedule') {
        state.modal.isGuidedTourEmployeesOpen = false
        state.modal.isGuidedTourDutyScheduleOpen = true
    }
    if (back === 'employees') {
        state.modal.isGuidedTourEndOpen = false
        state.modal.isGuidedTourEmployeesOpen = true
    }
}

function handleNextGuidedTour(next: any) {
    if (next === 'overview') {
        state.modal.isGuidedTourWelcomeOpen = false
        state.modal.isGuidedTourDailyOverviewOpen = true
    }
    if (next === 'citizens-overview') {
        state.modal.isGuidedTourDailyOverviewOpen = false
        state.modal.isGuidedTourCitizensOverviewOpen = true
    }
    if (next === 'calendar') {
        state.modal.isGuidedTourCitizensOverviewOpen = false
        state.modal.isGuidedTourCalendarOpen = true
    }
    if (next === 'duty-schedule') {
        state.modal.isGuidedTourCalendarOpen = false
        state.modal.isGuidedTourDutyScheduleOpen = true
    }
    if (next === 'employees') {
        state.modal.isGuidedTourDutyScheduleOpen = false
        state.modal.isGuidedTourEmployeesOpen = true
    }
    if (next === 'end') {
        state.modal.isGuidedTourEmployeesOpen = false
        state.modal.isGuidedTourEndOpen = true
    }
}

async function navigateToSupport() {
    await navigateTo('https://citizenone.dk/support', {
        external: true,
        open: {
            target: '_blank',
        }
    })
}

function toggleChatVisibility() {
    const chatElement = document.querySelector('.zsiq_floatmain') as any
    if (chatElement) {
        chatElement.style.setProperty('display', 'block', 'important')
        chatElement.style.setProperty('height', '100px', 'important')

        chatElement.click()
        closeSlide()
    }
}


async function navigateToCourses() {
    await navigateTo('https://citizenone.dk/priser/kurser', {
        external: true,
        open: {
            target: '_blank',
        }
    })
}

async function navigateToLatestFeatures() {
    await navigateTo('https://citizenone.dk/nye-funktioner', {
        external: true,
        open: {
            target: '_blank',
        }
    })
}
</script>