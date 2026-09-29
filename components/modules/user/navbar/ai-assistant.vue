<template>
    <div>
        <Tooltip :text="shortcutHint" position="bottom">
        <!-- Held to the top bar's 36px, so the controls beside the company
             name read as one row. It keeps its blue outline: it is the one
             control there that is an action rather than a setting. -->
        <FormButton buttonStyle="AI" buttonSize="xs" class="px-0 md:px-3 !h-9 !py-0"
            :aria-expanded="assistantStore.isOpen"
            :aria-label="ariaLabel"
            @click="userStore.getUser?.has_ai_access ? assistantStore.toggle() : navigateTo('/apps')">
            <!-- The mark carries the state, so the count is not the only thing
            saying there is something waiting. -->
            <ModulesUserNavbarCodyMark :size="20" :state="waiting > 0 ? 'attention' : 'idle'"
                class="md:!w-5 md:!h-5" />
            <!-- The name, not the action. "Spørg AI" told you what to do with it
            and nothing about what it is; the app is called Cody. -->
            <p class="text-sm font-semibold hidden lg:block">
                {{ $t('assistants.identity.name') }}
            </p>
            <span v-if="waiting > 0"
                class="ml-0.5 inline-flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-primary px-1.5 text-[11.5px] font-bold tabular-nums text-white">
                {{ waiting > 9 ? '9+' : waiting }}
            </span>
        </FormButton>
        </Tooltip>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { useUserStore } from '@/store/user'
import { useAssistantStore } from '@/store/assistant'

// The panel itself is rendered once by the user layout, not here - it has to
// outlive this button and the layout needs the open state to make room for it.
const userStore = useUserStore() as any
const assistantStore = useAssistantStore()
const { t } = useI18n()

// A shortcut nobody is told about is a shortcut nobody uses, and the button is
// the only place people look. Mac gets the symbol it expects.
const shortcutHint = computed(() => {
    const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform ?? '')

    return t('assistants.shortcutHint', { shortcut: isMac ? '⌘J' : 'Ctrl+J' })
})

/**
 * How many things need this user's attention right now, from the same brief the
 * My day page shows.
 *
 * The button used to be a door: it said "Ask AI" whether or not there was any
 * reason to press it. Cody knows at login that two doses are unregistered, and
 * a static label throws that away. The count is what earns the button its place
 * in the topbar - and pressing it opens the panel on the list the count is made
 * of, so the number always leads somewhere.
 *
 * The brief lives in the assistant store, shared with the panel and My day. A
 * failed or slow brief leaves the button in its plain state rather than showing
 * a stale or invented number, and nothing here blocks the topbar from rendering.
 */
const waiting = computed(() => assistantStore.waitingCount)

const ariaLabel = computed(() => waiting.value > 0
    ? `${t('assistants.askAI')} — ${t('assistants.waitingCount', { count: waiting.value })}`
    : t('assistants.askAI'))

onMounted(() => {
    if (userStore.getUser?.has_ai_access) assistantStore.loadBrief()
})
</script>
