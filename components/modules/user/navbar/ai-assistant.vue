<template>
    <div class="py-1">
        <FormButton buttonStyle="AI" buttonSize="xs" class="px-0 md:px-4"
            :aria-expanded="assistantStore.isOpen"
            :aria-label="ariaLabel"
            @click="userStore.getUser?.has_ai_access ? assistantStore.toggle() : navigateTo('/apps')">
            <ModulesUserNavbarCodyMark :size="20" :stroke-width="2.6" class="md:!w-5 md:!h-5" />
            <p class="text-sm font-semibold hidden lg:block">
                {{ $t('assistants.askAI') }}
            </p>
            <span v-if="state.waiting > 0"
                class="ml-0.5 inline-flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-primary px-1.5 text-[11.5px] font-bold tabular-nums text-white">
                {{ state.waiting > 9 ? '9+' : state.waiting }}
            </span>
        </FormButton>
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'
import { useAssistantStore } from '@/store/assistant'
import { dailyOverviewService } from '@/components/api/user/DailyOverviewService'
import { useI18n } from 'vue-i18n'

// The panel itself is rendered once by the user layout, not here - it has to
// outlive this button and the layout needs the open state to make room for it.
const userStore = useUserStore() as any
const assistantStore = useAssistantStore()
const { t } = useI18n()

const state = reactive({
    waiting: 0,
})

const ariaLabel = computed(() => state.waiting > 0
    ? `${t('assistants.askAI')} — ${t('assistants.waitingCount', { count: state.waiting })}`
    : t('assistants.askAI'))

/**
 * How many things need this user's attention right now, from the same brief the
 * My day page shows.
 *
 * The button used to be a door: it said "Ask AI" whether or not there was any
 * reason to press it. Cody knows at login that two doses are unregistered, and
 * a static label throws that away. The count is what earns the button its place
 * in the topbar.
 *
 * Deliberately quiet on failure. A badge is worth having when it is right and
 * worth nothing when it is wrong, so a failed or slow brief leaves the button in
 * its plain state rather than showing a stale or invented number. Nothing here
 * blocks the topbar from rendering.
 */
async function loadWaitingCount() {
    if (!userStore.getUser?.has_ai_access) return

    try {
        const response = await dailyOverviewService.getDailyBrief()
        const items = response?.items ?? response?.data?.items ?? []

        // Items arrive grouped - "missed_doses" with a count of 2 - and a person
        // reading the badge means things, not categories, so the counts are summed.
        state.waiting = items.reduce(
            (total: number, item: any) => total + (Number(item?.count) || 0),
            0,
        )
    } catch {
        state.waiting = 0
    }
}

onMounted(loadWaitingCount)
</script>
