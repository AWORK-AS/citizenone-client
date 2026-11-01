<template>
    <!-- "How many are you?" One click, after the account exists, so it never
         costs a signup. The answer reshapes the list below at once, which is
         the reason to answer: the page visibly gets more about them. -->
    <section v-if="!answered && !dismissed" data-testid="team-size"
        aria-labelledby="team-size-title" class="rounded-2xl border-1.5 border-primary/20 bg-white p-6">
        <div class="flex items-start justify-between gap-4">
            <div>
                <h2 id="team-size-title" class="text-lg font-semibold text-slate-900">{{ $t('teamSize.title') }}</h2>
                <p class="mt-1 text-sm text-slate-600">{{ $t('teamSize.desc') }}</p>
            </div>
            <button type="button" class="shrink-0 text-sm text-slate-500 hover:text-slate-700" @click="dismiss">
                {{ $t('teamSize.skip') }}
            </button>
        </div>
        <div class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button v-for="size in TEAM_SIZES" :key="size" type="button" :disabled="saving"
                :data-testid="`team-size-${size}`"
                class="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-800 hover:border-primary/40 hover:text-primary disabled:opacity-60"
                @click="choose(size)">
                {{ $t(`teamSize.options.${size}`) }}
            </button>
        </div>
    </section>
    <p v-else-if="justAnswered" data-testid="team-size-thanks" class="flex items-center gap-2 text-sm text-slate-600">
        <Icon name="ph:check-circle" class="size-5 text-emerald-500" aria-hidden="true" />
        {{ $t('teamSize.thanks') }}
    </p>
</template>

<script setup lang="ts">
import { companyService } from '@/components/api/user/CompanyService'
import { useUserStore } from '@/store/user'
import { TEAM_SIZES, isTeamSize, type TeamSize } from '@/composables/teamSize'

const userStore = useUserStore() as any

const DISMISS_KEY = 'co_team_size_skipped'
const saving = ref(false)
const justAnswered = ref(false)
const dismissed = ref(false)

const answered = computed(() => isTeamSize(userStore.getUser?.company?.onboarding_preferences?.team_size))

onMounted(() => {
    try { dismissed.value = localStorage.getItem(DISMISS_KEY) === '1' } catch { /* storage blocked: ask */ }
})

function dismiss() {
    dismissed.value = true
    try { localStorage.setItem(DISMISS_KEY, '1') } catch { /* nothing to remember it in */ }
}

async function choose(size: TeamSize) {
    const company = userStore.getUser?.company
    if (!company) return
    saving.value = true
    // Shown at once; the request only has to agree.
    const before = company.onboarding_preferences
    company.onboarding_preferences = { ...(before ?? {}), team_size: size }
    justAnswered.value = true
    try {
        await companyService.updateTeamSize({ team_size: size })
    } catch {
        company.onboarding_preferences = before
        justAnswered.value = false
    }
    saving.value = false
}
</script>
