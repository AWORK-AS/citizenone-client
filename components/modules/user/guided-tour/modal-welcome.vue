<template>
    <div>
        <div v-if="props.isModalOpen"
            class="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-lg p-8 overflow-hidden bg-white border shadow-lg z-50 rounded-md lg:top-[4.5rem] lg:h-fit lg:left-[22rem] lg:transform-none lg:max-w-3xl lg:overflow-visible"
            :class="modalClasses">
            <div class="absolute top-0 right-0 w-52 h-52 overflow-hidden">
                <img src="/img/icons/asset-01.svg" alt="Image failed to load"
                    class="absolute -top-14 -right-14 z-10 opacity-70 object-cover" id="animatedImage">
            </div>

            <div class="flex justify-end items-center mb-4">
                <button type="button"
                    class="top-4 right-3 z-10 outline-none px-0 py-2 text-gray-800 hover:text-gray-700"
                    @click="$emit('close')">
                    <Icon name="heroicons:x-mark" class="h-6 w-6 cursor-pointer" aria-hidden="true" />
                </button>
            </div>

            <div class="z-10 relative space-y-2 md:space-y-5">
                <div>
                    <iframe class="w-full h-44 lg:h-[405px]"
                        src="https://www.youtube.com/embed/1UQHRbuxfZQ?vq=hd1080&modestbranding=1&rel=0&controls=1"
                        title="CitizenOne" frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen>
                    </iframe>
                </div>

                <h3 class="text-lg md:text-2xl font-semibold text-secondary text-center ">
                    <span v-if="language.locale.value === 'en'">
                        Welcome to CitizenOne 👋
                    </span>
                    <span v-if="language.locale.value === 'dk'">
                        Velkommen til CitizenOne 👋
                    </span>
                </h3>

                <p class="text-center text-primary text-xs md:text-base">
                    <span v-if="language.locale.value === 'en'">
                        In this introduction, you will get a quick overview of CitizenOne and how the system creates
                        clarity and efficiency in your daily work.
                    </span>
                    <span v-if="language.locale.value === 'dk'">
                        I denne introduktion får du en hurtig gennemgang af CitizenOne og hvordan
                        systemet skaber overblik og effektivitet i din hverdag.
                    </span>
                </p>

                <div v-if="state.isSubscribed">
                    <div class="flex gap-x-2 justify-center" v-if="userStore.getUser?.user_subscription">
                        <FormButton buttonStyle="primary"
                            @click="navigateToExternalLink('https://citizenone.dk/priser-til-journalsystem/kurser')"
                            class="w-fit rounded-md">
                            <span v-if="language.locale.value === 'en'">
                                Take a course
                            </span>
                            <span v-else-if="language.locale.value === 'dk'">
                                Tag et kursus
                            </span>
                        </FormButton>
                    </div>
                    <div class="flex gap-x-2 justify-center" v-else>
                        <FormButton buttonStyle="primary"
                            @click="navigateToExternalLink('https://citizenone.dk/book-gratis-demo-af-journalsystemet')"
                            class="w-fit rounded-md">
                            <span v-if="language.locale.value === 'en'">
                                Book demo
                            </span>
                            <span v-else-if="language.locale.value === 'dk'">
                                Book demo
                            </span>
                        </FormButton>
                        <FormButton buttonStyle="get-started" @click="navigateToSubscription()"
                            class="w-fit rounded-md">
                            <span v-if="language.locale.value === 'en'">
                                Get started
                            </span>
                            <span v-else-if="language.locale.value === 'dk'">
                                Kom i gang
                            </span>
                        </FormButton>
                    </div>
                </div>

                <div class="flex gap-x-2 justify-center lg:justify-end" v-if="props.isGuidedTour">
                    <FormButton buttonStyle="primary" @click="handleNext" class="w-fit rounded-md px-6">
                        {{ $t('next') }}
                    </FormButton>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { useUserStore } from '@/store/user'

const props = defineProps({
    isGuidedTour: {
        type: Boolean,
        required: true,
    },
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})

const emit = defineEmits(['close', 'next'])
const language = useI18n()
const userStore = useUserStore() as any

const state = reactive({
    isSubscribed: false,
})

onMounted(() => {
    state.isSubscribed = true
})

watch(() => userStore.getUser, (user: any) => {
    if (user) {
        state.isSubscribed = true
    }
})

function closeModal() {
    emit('close')
}

function navigateToSubscription() {
    closeModal()
    navigateTo('/subscription/subscribe')
}

function handleNext() {
    emit('next', 'daily-overview')
}

async function navigateToExternalLink(link: any) {
    await navigateTo(link, {
        external: true,
        open: {
            target: '_blank',
        }
    })
}

const pageHeight = ref(window.innerHeight)

const modalClasses = computed(() => {
    return `after:absolute after:-left-4 after:w-0 after:h-0 after:border-t-[20px] after:border-t-transparent
        after:border-b-[20px] after:border-b-transparent after:border-r-[20px] after:border-r-white
        ${pageHeight.value < 800 ? "after:top-56" : "after:top-4"}`
})
</script>
