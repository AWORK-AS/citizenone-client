<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>FindSocialeTilbud.dk - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>FindSocialeTilbud.dk</template>

            <div
                class="absolute top-10 right-4 transition-transform duration-1000 ease-out transform translate-x-[-100%] animate-slide-in-right">
                <button @click="toggleOverlay"
                    class="items-center justify-center w-10 h-10 bg-tertiary text-white rounded-full shadow-lg lg:block hidden">
                    <span class="text-lg font-bold">?</span>
                </button>

            </div>
            <div v-if="state.modal.isOverlayVisible" :class="[
                'fixed inset-0 bg-black bg-opacity-50',
                state.modal.isModalZeroOpen ? 'z-40' : 'z-50'
            ]">
            </div>


            <div>
                <div class="max-w-5xl mx-auto mt-22">
                    <div class="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4">

                        <!-- Left side: Image -->
                        <div
                            class="hidden md:flex transition-transform duration-1000 ease-out transform translate-x-[-100%] animate-slide-in-right items-center justify-center">
                            <div
                                class="bg-transparent p-8 xl:p-10 h-full w-full max-w-md sm:max-w-lg lg:max-w-xl flex items-center justify-center">
                                <img src="/public/img/admin-profile.png" alt="Manage Company Visual"
                                    class="w-full h-auto object-cover transform scale-125" />

                            </div>
                        </div>

                        <!-- Darkening overlay -->
                        <div v-if="state.modal.isOverlayVisible"
                            class="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden md:block lg:block">
                        </div>



                        <!-- Right side: Content -->
                        <div class="flex items-center justify-center relative"
                            :class="{ 'bg-white': state.modal.isModalVisible, 'z-50': state.modal.isModalVisible }">

                            <div
                                class="transition-transform duration-1000 ease-out transform translate-x-[-100%] animate-slide-in-right bg-transparent rounded-md p-8 xl:p-10 flex flex-col justify-between h-full">
                                <!-- h3 Title with higher z-index -->

                                <div class="relative z-50" :class="{ 'bg-white': state.modal.isModalVisible }">
                                    <h3 class="text-2xl font-bold text-tertiary mb-4">
                                        <span v-if="language.locale.value === 'en'">
                                            Tell us about your place
                                        </span>
                                        <span v-if="language.locale.value === 'dk'">
                                            Fortæl os om dit sted
                                        </span>
                                    </h3>
                                </div>

                                <!-- Description and Button -->
                                <div class="space-y-4 text-gray-700">
                                    <p class="text-sm leading-6">
                                        <span v-if="language.locale.value === 'en'">
                                            By clicking the link below, you can complete your profile settings as shown
                                            on
                                            FindSocialeTilbud.dk.
                                        </span>
                                        <span v-if="language.locale.value === 'dk'">
                                            Ved at klikke på linket nedenfor kan du udfylde din profilindstillinger som
                                            vises på
                                            FindSocialeTilbud.dk.
                                        </span>
                                    </p>
                                    <p class="text-sm leading-6">
                                        <span v-if="language.locale.value === 'en'">
                                            It is important to become visible to caseworkers, citizens, relatives, and
                                            others.
                                        </span>
                                        <span v-if="language.locale.value === 'dk'">
                                            Det er vigtigt for at blive synlig overfor sagsbehandlere, borgere,
                                            pårørende m.fl.
                                        </span>
                                    </p>
                                </div>
                                <div class="mt-8">
                                    <FormButton type="button" buttonStyle="primary" class="w-full"
                                        @click="state.modal.isManageCompanyOpen = true">
                                        <span v-if="language.locale.value === 'en'">Complete your profile</span>
                                        <span v-if="language.locale.value === 'dk'">Udfyld din profil</span>
                                    </FormButton>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <div class="max-w-5xl mx-auto mt-24">
                    <div class="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2">
                        <!-- Left side: Description -->
                        <div class="flex items-center justify-center relative"
                            :class="{ 'bg-white': state.modal.isModalTwoVisible, 'z-50': state.modal.isModalTwoVisible }">
                            <div
                                class="transition-transform duration-1000 ease-out transform translate-x-[-100%] animate-slide-in bg-transparent rounded-md p-8 xl:p-10 flex flex-col justify-between h-full">
                                <div>
                                    <h3 class="text-2xl font-bold text-tertiary mb-4">
                                        <span v-if="language.locale.value === 'en'">
                                            Receive inquiries from caseworkers.
                                        </span>
                                        <span v-if="language.locale.value === 'dk'">
                                            Få henvendelser fra sagsbehandlere
                                        </span>
                                    </h3>
                                    <div class="space-y-4 text-gray-700">
                                        <p class="text-base sm:text-sm leading-relaxed sm:leading-6">
                                            <span v-if="language.locale.value === 'en'">
                                                You are almost ready to receive inquiries from caseworkers. The only
                                                thing you need
                                                to do is specify the type of placements you are interested in. Start by
                                                clicking the
                                                button below.
                                            </span>
                                            <span v-if="language.locale.value === 'dk'">
                                                Nu er du snart klar til at få henvendelser fra sagsbehandlere. Det
                                                eneste du blot
                                                mangler er at fortælle hvilken type anbringelser du er interesseret i.
                                                Start ved at
                                                klikke på knappen nedenfor.
                                            </span>
                                        </p>
                                    </div>

                                </div>
                                <div class="mt-8">
                                    <FormButton type="button" buttonStyle="primary" class="w-full"
                                        @click="state.modal.isShowInterestOpen = true">
                                        <span v-if="language.locale.value === 'en'">Fill out and get inquiries</span>
                                        <span v-if="language.locale.value === 'dk'">Udfyld og få henvendelser</span>
                                    </FormButton>

                                </div>
                            </div>
                        </div>
                        <div
                            class="hidden md:flex transition-transform duration-1000 ease-out transform translate-x-[-100%] animate-slide-in items-center justify-center">
                            <div class="bg-transparent rounded-md p-8 xl:p-10 h-full flex items-center justify-center">
                                <img src="/public/img/show-interest.png" alt="Company Visual"
                                    class="w-full h-auto object-cover transform scale-125" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <ModulesFindsocialetilbuddkModalManageCompany :isModalOpen="state.modal.isManageCompanyOpen"
                @close="state.modal.isManageCompanyOpen = false" />
            <ModulesFindsocialetilbuddkModalShowInterest :isModalOpen="state.modal.isShowInterestOpen"
                @close="state.modal.isShowInterestOpen = false" />
            <LazyModulesFindsocialetilbuddkTutorialModal0 :isModalZeroOpen="state.modal.isModalZeroOpen"
                @close="closeModalZero" @button-click="handleButtonClick" />

            <LazyModulesFindsocialetilbuddkTutorialModal1 :isModalOneOpen="state.modal.isModalVisible"
                @close="closeModal" @button-click="handleButtonClick" />
            <LazyModulesFindsocialetilbuddkTutorialModal2 :isModalTwoOpen="state.modal.isModalTwoVisible"
                @close="closeModal2" @button-click="handleButtonClick" />
            <LazyModulesFindsocialetilbuddkTutorialModal3 :isModalThreeOpen="state.modal.isModalThreeVisible"
                @close="closeModal3" />

        </NuxtLayout>
    </div>
</template>


<script setup lang="ts">
import { useI18n } from "vue-i18n"
const runtimeConfig = useRuntimeConfig()
import { useUserStore } from '@/store/user'
const language = useI18n()
const userStore = useUserStore()
const state = reactive({
    modal: {
        isManageCompanyOpen: false,
        isShowInterestOpen: false,
        isImageModalOpen: false,
        isOverlayVisible: false,
        isModalZeroOpen: false,
        isModalVisible: false,
        isModalTwoVisible: false,
        isModalThreeVisible: false,
    },
})

const checkFirstTime = () => {
    const isFirstTime = localStorage.getItem('isFirstTime')
    if (!isFirstTime || isFirstTime == "true") {
        state.modal.isOverlayVisible = true
        state.modal.isModalZeroOpen = true
        userStore.setInTutorial(true)
    } else {
        userStore.setInTutorial(false)
    }
}

const toggleOverlay = () => {
    state.modal.isOverlayVisible = !state.modal.isOverlayVisible
    state.modal.isModalZeroOpen = !state.modal.isModalZeroOpen
    userStore.setInTutorial(true)

}

const handleButtonClick = (flag: any) => {
    if (flag == "0") {
        state.modal.isOverlayVisible = !state.modal.isOverlayVisible
        state.modal.isModalZeroOpen = false
        userStore.setInTutorial(false)
    }
    else if (flag == "1") {
        state.modal.isOverlayVisible = !state.modal.isOverlayVisible
        state.modal.isModalVisible = false
        userStore.setInTutorial(false)
    }
    else if (flag == "2") {
        state.modal.isOverlayVisible = !state.modal.isOverlayVisible
        state.modal.isModalTwoVisible = false
        userStore.setInTutorial(false)
    }
}

const closeModalZero = () => {
    state.modal.isModalZeroOpen = false
    state.modal.isModalVisible = true
}

const closeModal = () => {
    state.modal.isModalVisible = false
    state.modal.isModalTwoVisible = true
}

const closeModal2 = () => {
    state.modal.isModalTwoVisible = false
    state.modal.isModalThreeVisible = true
}

const closeModal3 = () => {
    state.modal.isModalThreeVisible = false
    state.modal.isOverlayVisible = false
    userStore.setInTutorial(false)
    localStorage.setItem('isFirstTime', 'false')
}

onMounted(() => {
    checkFirstTime()
})
</script>

<style scoped>
@keyframes slideIn {
    0% {
        transform: translateX(-100%)
    }

    100% {
        transform: translateX(0)
    }
}

.animate-slide-in {
    animation: slideIn 2s ease-out forwards
}

@keyframes slideInRight {
    0% {
        transform: translateX(100%)
    }

    100% {
        transform: translateX(0)
    }
}

.animate-slide-in-right {
    animation: slideInRight 2s ease-out forwards
}
</style>