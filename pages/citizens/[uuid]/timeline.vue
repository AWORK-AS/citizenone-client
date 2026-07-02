<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.tabs.timeline') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks">
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo('/citizens')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ customPagesStore.getCustomPagesName?.citizens }}
                            </button>
                        </div>
                    </template>
                </Breadcrumb>
            </template>

            <template #header>{{ $t('citizens.tabs.timeline') }}</template>

            <div class="space-y-5">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesUserCitizenDetailsHeader />
                <ModulesUserCitizenJournalTabs />

                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="mt-8 space-y-5">
                        <div class="flex justify-end">
                            <FormButton buttonStyle="action" @click="state.isAddOpen = true">
                                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('citizens.timeline.newEvent') }}
                            </FormButton>
                        </div>

                        <ModulesUserCitizenTimelineEntryList :timeline="state.timeline" @delete="deleteEvent" />
                    </div>
                </LoadingSpinner>
            </div>
        </NuxtLayout>

        <ModulesUserCitizenTimelineModalNew :isModalOpen="state.isAddOpen" :citizenUuid="(citizenUuid as string)"
            @close="state.isAddOpen = false" @refresh="fetchTimeline" />
    </div>
</template>

<script setup lang="ts">
import { timelineService } from '@/components/api/user/TimelineService'
import { useAlert } from '@/composables/alert'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t, locale } = useI18n()
const customPagesStore = useCustomPagesStore() as any
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid

const breadcrumbLinks = [
    {
        name: 'citizens.tabs.timeline',
        translate: true,
        href: `/citizens/${citizenUuid}/timeline`,
    },
]

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    isAddOpen: false,
    timeline: [] as any[],
})

onMounted(() => {
    fetchTimeline()
})

watch(locale, () => {
    fetchTimeline()
})

async function fetchTimeline() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await timelineService.getTimeline(citizenUuid)
        state.timeline = response?.data ?? []
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function deleteEvent(uuid: string) {
    try {
        await timelineService.deleteEvent(uuid)
        successAlert(`${t('alert.success')}!`, `${t('citizens.timeline.alert.deletedSuccessfully')}.`)
        fetchTimeline()
    } catch (error: any) {
        state.error = error
    }
}
</script>
