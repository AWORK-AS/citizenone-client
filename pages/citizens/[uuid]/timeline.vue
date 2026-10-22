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

                        <div ref="olderSentinel" class="flex justify-center py-2">
                            <FormButton v-if="state.hasMore" buttonStyle="secondary" :disabled="state.isLoadingOlder"
                                @click="loadOlder">
                                <Icon v-if="state.isLoadingOlder" name="ph:spinner" class="h-4 w-4 animate-spin"
                                    aria-hidden="true" />
                                {{ $t('citizens.timeline.loadOlder') }}
                            </FormButton>
                            <p v-else-if="state.timeline.length > 0" class="text-xs text-gray-500">
                                {{ $t('citizens.timeline.allLoaded') }}
                            </p>
                        </div>
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
import { TIMELINE_PAGE_SIZE, mergeTimelinePage, timelineHasMore } from '@/composables/timelinePaging'
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
    page: 1,
    hasMore: false,
    isLoadingOlder: false,
})

const olderSentinel = ref<HTMLElement | null>(null)
let olderObserver: IntersectionObserver | null = null

onMounted(() => {
    fetchTimeline()

    // Scrolling to the end of the list loads the next older page; the button
    // stays for keyboard users and for when the observer is unavailable.
    if (typeof IntersectionObserver !== 'undefined') {
        olderObserver = new IntersectionObserver((entries) => {
            if (entries.some(entry => entry.isIntersecting)) {
                loadOlder()
            }
        }, { rootMargin: '200px' })
        if (olderSentinel.value) {
            olderObserver.observe(olderSentinel.value)
        }
    }
})

// The list sits inside the loading spinner, so the sentinel is replaced each
// time the timeline reloads; follow it.
watch(olderSentinel, (element, previous) => {
    if (previous) {
        olderObserver?.unobserve(previous)
    }
    if (element) {
        olderObserver?.observe(element)
    }
})

onBeforeUnmount(() => {
    olderObserver?.disconnect()
})

watch(locale, () => {
    fetchTimeline()
})

// Starts over from the newest page: on load, after adding or deleting an
// event, and when the language changes.
async function fetchTimeline() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await timelineService.getTimeline(citizenUuid, { page: 1, per_page: TIMELINE_PAGE_SIZE })
        state.timeline = response?.data ?? []
        state.page = 1
        state.hasMore = timelineHasMore(response?.meta)
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function loadOlder() {
    if (!state.hasMore || state.isLoadingOlder || state.isPageLoading) {
        return
    }
    state.isLoadingOlder = true
    try {
        const nextPage = state.page + 1
        const response = await timelineService.getTimeline(citizenUuid, { page: nextPage, per_page: TIMELINE_PAGE_SIZE })
        state.timeline = mergeTimelinePage(state.timeline, response?.data ?? [])
        state.page = nextPage
        state.hasMore = timelineHasMore(response?.meta)
    } catch (error: any) {
        state.error = error
    }
    state.isLoadingOlder = false
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
