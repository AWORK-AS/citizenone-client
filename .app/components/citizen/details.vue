<template>
    <div class="space-y-10">
        <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
            <Icon name="ph:arrow-left" class="text-black h-6 w-6 dark:text-white" />
            <span>Back</span>
        </NuxtLink>
        <div class="grid sm:grid-cols-12 md:gap-8">
            <div class="col-span-12 sm:col-span-4">
                <div class="flex w-full items-center gap-2">
                    <BaseAvatar :src="state.citizenAvatar" size="md" />
                    <div class="">
                        <BaseHeading tag="h2" size="md" weight="medium" lead="none">
                            {{ state?.selectedCitizen?.firstname }}
                            {{ state?.selectedCitizen?.lastname }}
                        </BaseHeading>
                        <BaseParagraph size="xs" class="text-muted-400">
                            {{ state?.selectedCitizen?.email }}
                        </BaseParagraph>
                        <BaseParagraph size="xs" class="text-muted-400">
                            {{ state?.selectedCitizen?.phone }}
                        </BaseParagraph>
                    </div>
                </div>
                <div class="mt-8 max-w-[240px]">
                    <ul class="space-y-1 font-sans text-sm">
                        <li>
                            <NuxtLink :to="`/citizens/details/${citizenUuid}/journal`"
                                exact-active-class="!text-primary-500 !bg-primary-500/10"
                                class="text-muted-400 hover:text-muted-600 dark:hover:text-muted-200 hover:bg-muted-50 dark:hover:bg-muted-700/50 flex items-center gap-2 rounded-lg p-3 transition-colors duration-300">
                                <Icon name="ph:book-open-duotone" class="size-4" />
                                <span>Journal</span>
                            </NuxtLink>
                        </li>
                        <li>
                            <NuxtLink :to="`/citizens/details/${citizenUuid}/medicine-journal`"
                                exact-active-class="!text-primary-500 !bg-primary-500/10"
                                class="text-muted-400 hover:text-muted-600 dark:hover:text-muted-200 hover:bg-muted-50 dark:hover:bg-muted-700/50 flex items-center gap-2 rounded-lg p-3 transition-colors duration-300">
                                <Icon name="ph:user-duotone" class="size-4" />
                                <span>Medicine Journal</span>
                            </NuxtLink>
                        </li>
                        <li>
                            <NuxtLink :to="`/citizens/details/${citizenUuid}/plans-and-goals`"
                                exact-active-class="!text-primary-500 !bg-primary-500/10"
                                class="text-muted-400 hover:text-muted-600 dark:hover:text-muted-200 hover:bg-muted-50 dark:hover:bg-muted-700/50 flex items-center gap-2 rounded-lg p-3 transition-colors duration-300">
                                <Icon name="ph:user-duotone" class="size-4" />
                                <span>Plans and Goals</span>
                            </NuxtLink>
                        </li>
                        <li>
                            <NuxtLink :to="`/citizens/details/${citizenUuid}/documents`"
                                exact-active-class="!text-primary-500 !bg-primary-500/10"
                                class="text-muted-400 hover:text-muted-600 dark:hover:text-muted-200 hover:bg-muted-50 dark:hover:bg-muted-700/50 flex items-center gap-2 rounded-lg p-3 transition-colors duration-300">
                                <Icon name="ph:user-duotone" class="size-4" />
                                <span>Documents</span>
                            </NuxtLink>
                        </li>
                        <li>
                            <NuxtLink :to="`/citizens/details/${citizenUuid}/attendance`"
                                exact-active-class="!text-primary-500 !bg-primary-500/10"
                                class="text-muted-400 hover:text-muted-600 dark:hover:text-muted-200 hover:bg-muted-50 dark:hover:bg-muted-700/50 flex items-center gap-2 rounded-lg p-3 transition-colors duration-300">
                                <Icon name="ph:user-duotone" class="size-4" />
                                <span>Attendace</span>
                            </NuxtLink>
                        </li>
                        <li>
                            <NuxtLink :to="`/citizens/details/${citizenUuid}/log`"
                                exact-active-class="!text-primary-500 !bg-primary-500/10"
                                class="text-muted-400 hover:text-muted-600 dark:hover:text-muted-200 hover:bg-muted-50 dark:hover:bg-muted-700/50 flex items-center gap-2 rounded-lg p-3 transition-colors duration-300">
                                <Icon name="ph:user-duotone" class="size-4" />
                                <span>Log</span>
                            </NuxtLink>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="col-span-12 sm:col-span-8">
                <slot />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { citizenService } from '@/components/api/CitizenService'

const route = useRoute()
const citizenUuid = route.params.slug
let errorMessage = ''

const state = reactive({
    citizenAvatar: '/img/avatars/user.svg',
    error: null,
    isPageLoading: false,
    selectedCitizen: [],
})

onMounted(() => {
    fetchSelectedCitizen()
})

async function fetchSelectedCitizen() {
    state.isPageLoading = true
    try {
        const response = await citizenService.getCitizen(citizenUuid)
        if (response) {
            if (response?.data?.image) {
                state.citizenAvatar = response?.data?.image
            }
            state.selectedCitizen = response?.data
        }
    } catch (error: any) {
        errorMessage = error.message
    }
    state.isPageLoading = false
}
</script>