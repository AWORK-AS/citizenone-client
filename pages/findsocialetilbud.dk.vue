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
                                <img src="https://media.istockphoto.com/id/1349030917/photo/business-and-finance-looking-up-at-high-rise-office-buildings-in-the-financial-district-of-a.jpg?s=612x612&w=0&k=20&c=NSnN0va-f1OBG_GA7bTVmUIoBwNDKUXtHD8_PzeTNiA="
                                    alt="Manage Company Visual" class="w-full h-auto object-cover transform scale-125"
                                    style="border-radius: 78% 22% 75% 25% / 26% 86% 14% 74% " />

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
                                            Manage Your Presence on FindSocialeTilbud.dk
                                        </span>
                                        <span v-if="language.locale.value === 'dk'">
                                            Administrér Din Tilstedeværelse på FindSocialeTilbud.dk
                                        </span>
                                    </h3>
                                </div>

                                <!-- Description and Button -->
                                <div class="space-y-4 text-gray-700">
                                    <p class="text-sm leading-6">
                                        <span v-if="language.locale.value === 'en'">
                                            Get your company noticed by a wide audience on Denmark's largest platform
                                            for social services. By managing your presence on FindSocialeTilbud.dk, you
                                            can
                                            showcase your
                                            services to caseworkers, social workers, citizens, and families looking for
                                            relevant
                                            support. Easily update your
                                            offerings, ensure your information is up to date, and connect with those
                                            in need of
                                            your services.
                                        </span>
                                        <span v-if="language.locale.value === 'dk'">
                                            Få din virksomhed bemærket af et bredt publikum på Danmarks største
                                            platform for sociale tilbud. Ved at administrere din tilstedeværelse på
                                            FindSocialeTilbud.dk kan du fremhæve dine tjenester over for sagsbehandlere,
                                            socialarbejdere, borgere og familier, der søger relevant støtte. Opdater
                                            nemt
                                            dine tilbud, sørg for, at dine oplysninger er opdaterede, og skab
                                            forbindelse
                                            til dem, der har brug for dine ydelser.
                                        </span>
                                    </p>
                                    <p class="text-sm leading-6">
                                        <span v-if="language.locale.value === 'en'">
                                            Whether you're a provider of social care, counseling, or other social
                                            offerings,
                                            FindSocialeTilbud.dk is the perfect place to reach those who need your help
                                            the
                                            most.
                                        </span>
                                        <span v-if="language.locale.value === 'dk'">
                                            Uanset om du tilbyder social omsorg, rådgivning eller andre sociale ydelser,
                                            er FindSocialeTilbud.dk det perfekte sted at nå dem, der har mest brug
                                            for din hjælp.
                                        </span>
                                    </p>
                                </div>
                                <div class="mt-8">
                                    <FormButton type="button" buttonStyle="primary" class="w-full"
                                        @click="state.modal.isManageCompanyOpen = true">
                                        {{ $t('findsocialetilbuddk.manageCompany.manageCompany') }}
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
                                        {{ $t('findsocialetilbuddk.showInterest.getInquiriesViaFindSocialeTilbudDk')
                                        }}
                                    </h3>
                                    <div class="space-y-4 text-gray-700">
                                        <p class="text-base sm:text-sm leading-relaxed sm:leading-6">
                                            <span v-if="language.locale.value === 'en'">
                                                FindSocialeTilbud.dk - Denmark's largest search engine for social
                                                services -
                                                provides easy access to important social resources. Through the
                                                platform,
                                                caseworkers, social workers, relatives, citizens, and other stakeholders
                                                can quickly
                                                find relevant services and offerings.
                                            </span>
                                            <span v-if="language.locale.value === 'dk'">
                                                FindSocialeTilbud.dk er Danmarks største søgemaskine for sociale tilbud,
                                                der giver
                                                nem adgang til vigtige sociale ressourcer. Platformen gør det muligt for
                                                sagsbehandlere, socialarbejdere, pårørende, borgere og andre
                                                interessenter hurtigt
                                                at finde relevante tjenester og tilbud.
                                            </span>
                                        </p>
                                        <p class="text-base sm:text-sm leading-relaxed sm:leading-6">
                                            <span v-if="language.locale.value === 'en'">
                                                Whether you're looking for assistance for a citizen, support for
                                                relatives, or
                                                social services in your area, you can rely on FindSocialeTilbud.dk to
                                                deliver
                                                accurate and up-to-date results, making it easier to make informed
                                                decisions.
                                            </span>
                                            <span v-if="language.locale.value === 'dk'">
                                                Uanset om du søger hjælp til en borger, støtte til pårørende eller
                                                sociale tilbud i
                                                dit område, kan du stole på FindSocialeTilbud.dk til at levere præcise
                                                og opdaterede
                                                resultater, hvilket gør det nemmere at træffe velinformerede
                                                beslutninger.
                                            </span>
                                        </p>
                                    </div>

                                </div>
                                <div class="mt-8">
                                    <FormButton type="button" buttonStyle="primary" class="w-full"
                                        @click="state.modal.isShowInterestOpen = true">
                                        {{ $t('findsocialetilbuddk.showInterest.showInterest') }}
                                    </FormButton>
                                </div>
                            </div>
                        </div>
                        <div
                            class="hidden md:flex transition-transform duration-1000 ease-out transform translate-x-[-100%] animate-slide-in items-center justify-center">
                            <div class="bg-transparent rounded-md p-8 xl:p-10 h-full flex items-center justify-center">
                                <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                    alt="Company Visual" class="w-full h-auto object-cover transform scale-125"
                                    style="border-radius: 78% 22% 75% 25% / 26% 86% 14% 74% " />
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
                @close="closeModalZero" />
            <LazyModulesFindsocialetilbuddkTutorialModal1 :isModalOneOpen="state.modal.isModalVisible"
                @close="closeModal" />
            <LazyModulesFindsocialetilbuddkTutorialModal2 :isModalTwoOpen="state.modal.isModalTwoVisible"
                @close="closeModal2" />
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
const inTutorial = userStore.getInTutorial
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
    }
}



const toggleOverlay = () => {
    state.modal.isOverlayVisible = !state.modal.isOverlayVisible
    state.modal.isModalZeroOpen = !state.modal.isModalZeroOpen
    userStore.setInTutorial(true)

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