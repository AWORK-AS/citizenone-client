<template>
    <TransitionRoot as="template" :show="props.isModalOpen">
        <Dialog as="div" class="relative z-50" @close="$emit('close')">
            <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
                leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
                <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </TransitionChild>

            <div class="fixed z-10 inset-0 overflow-y-auto">
                <div class="flex lg:items-center justify-center px-4 pt-16 pb-4 text-center">
                    <TransitionChild as="template" enter="ease-out duration-300" leave="ease-in duration-200"
                        leave-from="opacity-100 translate-y-0 scale-100" leave-to="opacity-0 translate-y-0 scale-95">
                        <DialogPanel
                            class="bg-white relative overflow-clip text-left shadow-xl transform transition-all p-8 w-full rounded-md"
                            :class="[props.size === 'xs' && 'max-w-lg', props.size === 'sm' && 'max-w-xl', props.size === 'md' && 'max-w-2xl', props.size === 'lg' && 'max-w-3xl', props.size === 'xl' && 'max-w-4xl', props.size === '2xl' && 'max-w-5xl', props.size === '3xl' && 'max-w-6xl', props.size === '4xl' && 'max-w-7xl', props.size === 'full' && 'max-w-full']">
                            <img src="/img/icons/asset-01.svg" alt="Image failed to load"
                                class="w-52 absolute -top-14 -right-14 z-10 opacity-70" id="animatedImage">
                            <div class="relative z-20">
                                <div class="flex items-center">
                                    <DialogTitle as="h3" class="text-lg leading-6 font-medium text-gray-900">
                                        {{ props.title }}
                                    </DialogTitle>
                                    <div class="grow flex justify-end">
                                        <button type="button"
                                            class="flex items-center justify-center gap-x-2 outline-none px-0 py-2 text-gray-800 hover:text-gray-700">
                                            <Icon name="heroicons:x-mark" class="h-6 w-6 cursor-pointer"
                                                aria-hidden="true" @click="$emit('close')" />
                                        </button>
                                    </div>
                                </div>
                                <div class="mt-4">
                                    <div class="space-y-2 md:space-y-5">
                                        <div>
                                            <iframe class="w-full h-44 lg:h-[405px]"
                                                src="https://citizenone.dk/wp-content/uploads/2025/05/Tak-fordi-du-saa-med-CitizenOne.mp4"
                                                title="CitizenOne" frameborder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowfullscreen>
                                            </iframe>
                                        </div>

                                        <h3 class="text-lg md:text-2xl font-semibold text-secondary text-center ">
                                            <span v-if="language.locale.value === 'en'">
                                                🎉 You made it to the finish line 😉
                                            </span>
                                            <span v-if="language.locale.value === 'dk'">
                                                🎉 Så kom du i mål 😉
                                            </span>
                                        </h3>

                                        <p class="text-center text-primary text-xs md:text-base">
                                            <span v-if="language.locale.value === 'en'">
                                                Even though we haven't covered all the features, we hope you've gotten a
                                                bit more insight into
                                                CitizenOne. If you have any questions, we're always ready to help you
                                                further ☺️
                                            </span>
                                            <span v-if="language.locale.value === 'dk'">
                                                Selvom vi faktisk ikke har været hele vejen rundt på alle funktioner, så
                                                håber vi,
                                                at du er blevet lidt klogere på CitizenOne. Har du spørgsmål, er vi
                                                altid klar til at
                                                hjælpe dig videre ☺️
                                            </span>
                                        </p>

                                        <div v-if="state.isSubscribed">
                                            <div class="flex gap-x-2 justify-center"
                                                v-if="userStore.getUser?.user_subscription">
                                                <FormButton buttonStyle="primary"
                                                    @click="navigateToExternalLink('https://citizenone.dk/priser-til-journalsystem/kurser')"
                                                    class="w-fit">
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
                                                    class="w-fit">
                                                    <span v-if="language.locale.value === 'en'">
                                                        Book demo
                                                    </span>
                                                    <span v-else-if="language.locale.value === 'dk'">
                                                        Book demo
                                                    </span>
                                                </FormButton>
                                                <FormButton buttonStyle="get-started" @click="navigateToSubscription()"
                                                    class="w-fit">
                                                    <span v-if="language.locale.value === 'en'">
                                                        Get started
                                                    </span>
                                                    <span v-else-if="language.locale.value === 'dk'">
                                                        Kom i gang
                                                    </span>
                                                </FormButton>
                                            </div>
                                        </div>

                                        <div class="flex gap-x-2 justify-center lg:justify-end"
                                            v-if="props.isGuidedTour">
                                            <FormButton buttonStyle="primary" @click="handleBack()" class="w-fit px-6">
                                                {{ $t('back') }}
                                            </FormButton>
                                            <FormButton buttonStyle="primary" @click="closeModal" class="w-fit px-6">
                                                {{ $t('close') }}
                                            </FormButton>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { useI18n } from "vue-i18n"
import { useUserStore } from '@/store/user'

const props = defineProps({
    size: {
        type: String,
        required: false,
        default: 'lg',
    },
    title: {
        type: String,
        required: false,
    },
    isGuidedTour: {
        type: Boolean,
        required: true,
    },
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})

const emit = defineEmits(['close', 'back', 'next'])
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

function handleBack() {
    emit('back', 'employees')
}

async function navigateToExternalLink(link: any) {
    await navigateTo(link, {
        external: true,
        open: {
            target: '_blank',
        }
    })
}
</script>