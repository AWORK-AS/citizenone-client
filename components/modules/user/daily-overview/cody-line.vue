<template>
    <section v-if="state.summary || state.loading"
        class="flex items-start gap-3 rounded-xl bg-primary-25 px-5 py-4 ring-1 ring-primary/15">
        <ModulesUserNavbarCodyMark :size="20" :working="state.loading"
            class="mt-0.5 shrink-0 text-primary" />

        <div class="min-w-0 flex-1">
            <p v-if="state.loading" class="text-sm text-gray-500">{{ $t('myDay.cody.reading') }}</p>

            <div v-else class="text-sm leading-relaxed text-gray-900 [&_p]:m-0 [&_p+p]:mt-1.5 [&_strong]:font-semibold"
                v-safe-html="state.summary" />

            <button v-if="!state.loading" type="button"
                class="mt-2 text-xs font-semibold text-primary hover:underline"
                @click="askMore">
                {{ $t('myDay.cody.askMore') }}
            </button>
        </div>
    </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/store/user'
import { useAssistantStore } from '@/store/assistant'
import { aIAssistantService } from '@/components/api/user/AIAssistantService'

/**
 * What today's brief means, in a sentence, at the top of the page.
 *
 * The rest of My day lists: twenty-two medicines, two unregistered doses, four
 * reminders. Listing is not the same as telling someone how their day looks,
 * and the difference between a dashboard and an assistant is whoever does that
 * second job. This is Cody doing it on the first screen after login.
 *
 * It reads the brief the page has already fetched rather than fetching its own,
 * so the assistant is summarising exactly what the reader can see below it.
 */
const props = defineProps({
    items: { type: Array as () => any[], required: true },
})

const { t, locale } = useI18n()
const userStore = useUserStore() as any
const assistantStore = useAssistantStore()

const state = reactive({
    loading: false,
    summary: '',
})

/**
 * One call per person per day, per device.
 *
 * This sits on the most-visited page in the product, so a call on every load
 * would be a charge on every load - against a balance we have only just given
 * customers the means to watch. A morning summary does not need to be rebuilt
 * when someone returns to the page after lunch, so it is not.
 *
 * Cached client-side rather than server-side because that needs no endpoint and
 * the cost of a cache miss is one extra call, not a wrong answer.
 */
function cacheKey() {
    const today = new Date().toISOString().slice(0, 10)
    return `cody-day:${userStore.getUser?.uuid ?? 'unknown'}:${today}:${locale.value}`
}

function readCache(): string | null {
    try {
        return localStorage.getItem(cacheKey())
    } catch {
        // Private windows and cleared site data both land here. A missing cache
        // costs one call; a thrown error would cost the whole page.
        return null
    }
}

function writeCache(html: string) {
    try {
        localStorage.setItem(cacheKey(), html)
    } catch { /* not worth failing over */ }
}

/**
 * Built from the brief the page is already showing, in the reader's own
 * language, and deliberately from the item keys and counts rather than from the
 * detail lines: the details carry initials and times, and this summary is read
 * at a glance on a screen other people can see.
 */
function buildPrompt() {
    const lines = props.items
        .map((item: any) => `- ${t(`myDay.brief.${item.key}`, item.count)}`)
        .join('\n')

    return t('myDay.cody.prompt', { lines })
}

async function load() {
    if (!userStore.getUser?.has_ai_access || !props.items.length) return

    const cached = readCache()
    if (cached) {
        state.summary = cached
        return
    }

    state.loading = true

    try {
        const formData = new FormData()
        formData.append('prompt', buildPrompt())

        const response = await aIAssistantService.sendMessage(formData)
        const answer = response?.data?.answer ?? ''

        if (answer) {
            state.summary = answer
            writeCache(answer)
        }
    } catch {
        // Quiet on failure, like the count badge in the topbar: a summary that
        // is wrong or missing is worth nothing, and the page behind it is worth
        // the same with or without it. A rate limit or a spent balance must not
        // turn the first screen after login into an error.
        state.summary = ''
    } finally {
        state.loading = false
    }
}

function askMore() {
    assistantStore.askAbout(t('myDay.cody.askMorePrompt'))
}

onMounted(load)

// The brief arrives after the page mounts, so the first render has nothing to
// summarise. Runs once: items settle, they do not keep changing.
watch(() => props.items.length, (count: number, previous: number) => {
    if (count > 0 && !previous) load()
})
</script>
