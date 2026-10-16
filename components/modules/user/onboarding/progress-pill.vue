<template>
    <button v-if="visible" type="button" @click="navigateTo('/discover')"
        :aria-label="$t('discover.pill', { done, total })"
        class="flex items-center gap-2 rounded-full border border-secondary-100 bg-secondary-25 px-2.5 py-1 text-sm font-medium text-primary hover:border-secondary-200 transition-colors">
        <svg class="size-5 -rotate-90" viewBox="0 0 20 20" aria-hidden="true">
            <circle cx="10" cy="10" r="8" fill="none" stroke-width="3" class="stroke-secondary-100" />
            <circle cx="10" cy="10" r="8" fill="none" stroke-width="3" stroke-linecap="round"
                class="stroke-secondary-400 transition-all duration-500"
                :stroke-dasharray="CIRCUMFERENCE" :stroke-dashoffset="CIRCUMFERENCE * (1 - done / total)" />
        </svg>
        <span class="hidden md:inline">{{ $t('discover.pill', { done, total }) }}</span>
    </button>
</template>

<script setup lang="ts">
// Getting-started progress, shown in the topbar so it is visible from every
// page and not only on /discover. It counts the backend checklist, the same
// milestones Milo's tour and the activation mails go by, and leaves the
// topbar once they are all done or the Discover journey has been completed.
import { userService } from '@/components/api/user/UserService'
import { usePermissions } from '@/composables/usePermissions'
import { useDiscoverDone } from '@/composables/useDiscoverDone'

const CIRCUMFERENCE = 2 * Math.PI * 8
// The checklist is a handful of exists() queries; once a minute is plenty.
const REFRESH_MS = 60_000

const route = useRoute()
const { isAtLeast } = usePermissions()
const { completed } = useDiscoverDone()

const steps = ref<{ key: string, done: boolean }[]>([])
let fetchedAt = 0

const total = computed(() => steps.value.length)
const done = computed(() => steps.value.filter(s => s.done).length)

const visible = computed(() =>
    isAtLeast('Admin')
    && !completed.value
    && total.value > 0
    && done.value < total.value
    && route.path !== '/discover'
)

async function refresh() {
    if (!isAtLeast('Admin') || completed.value) return
    if (Date.now() - fetchedAt < REFRESH_MS) return
    fetchedAt = Date.now()
    try {
        const response: any = await userService.getOnboardingChecklist()
        const checklist = response?.steps ? response : response?.data
        steps.value = Array.isArray(checklist?.steps) ? checklist.steps : []
    } catch (e) { /* an older backend has no checklist: show nothing */ }
}

onMounted(refresh)
// Coming back from /discover or after adding the first citizen is when the
// count usually moves.
watch(() => route.path, refresh)
</script>
