<template>
    <!-- One step at a time, done in place. Replaces the spotlight tour, which
         covered the page it was explaining. See composables/firstSteps.ts. -->
    <section v-if="visible" data-testid="first-steps" aria-labelledby="first-steps-title"
        class="rounded-2xl border-1.5 border-primary/20 bg-white p-6">
        <div class="flex items-start justify-between gap-4">
            <div>
                <!-- On My day the guide is the greeting while it is open: one card, not two. -->
                <p v-if="greeting" class="mb-3 text-xl font-semibold text-slate-900">{{ greeting }}</p>
                <p class="text-xs font-semibold uppercase tracking-wide text-primary">
                    {{ $t('firstSteps.label', { current: index + 1, total: steps.length }) }}
                </p>
                <h2 id="first-steps-title" class="mt-1 text-lg font-semibold text-slate-900">
                    {{ $t(`firstSteps.${role}.${current.key}.title`) }}
                </h2>
            </div>
            <button type="button" @click="finish" class="shrink-0 text-sm text-slate-500 hover:text-slate-700">
                {{ $t('firstSteps.skip') }}
            </button>
        </div>

        <!-- Step strip: where you are and what is done. -->
        <ol class="mt-4 flex gap-2" :aria-label="$t('firstSteps.progress')">
            <li v-for="(step, i) in steps" :key="step.key" class="flex-1">
                <button type="button" @click="index = i"
                    :aria-current="i === index ? 'step' : undefined"
                    :aria-label="$t(`firstSteps.${role}.${step.key}.title`)"
                    class="block h-1.5 w-full rounded-full transition-colors"
                    :class="isDone(step) ? 'bg-emerald-500' : (i === index ? 'bg-primary' : 'bg-slate-200')" />
            </li>
        </ol>

        <p class="mt-4 text-sm text-slate-600">{{ $t(`firstSteps.${role}.${current.key}.desc`) }}</p>

        <!-- Staff: the citizens they can see, one click from their page. -->
        <ul v-if="current.key === 'citizens'" class="mt-3 flex flex-wrap gap-2">
            <li v-for="citizen in citizens.slice(0, 6)" :key="citizen.value">
                <NuxtLink :to="`/citizens/${citizen.value}`"
                    class="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-700 hover:border-primary/40 hover:text-primary">
                    {{ citizen.label }}
                </NuxtLink>
            </li>
            <li v-if="!citizens.length" class="text-sm text-slate-500">{{ $t('firstSteps.noCitizens') }}</li>
        </ul>

        <!-- Staff: care work is often written on the phone. -->
        <div v-if="current.key === 'app'" class="mt-4 flex flex-wrap gap-6">
            <a v-for="store in APP_STORES" :key="store.key" :href="store.url" target="_blank" rel="noopener"
                class="flex flex-col items-center gap-2 text-sm font-medium text-slate-700 hover:text-primary">
                <span class="rounded-xl border border-slate-100 bg-slate-50 p-1.5">
                    <QRCodeVue3 :value="store.url" :width="96" :height="96" :qrOptions="{ errorCorrectionLevel: 'M' }"
                        :dotsOptions="{ type: 'rounded', color: '#205E77' }"
                        :cornersSquareOptions="{ type: 'extra-rounded', color: '#205E77' }" />
                </span>
                <span class="inline-flex items-center gap-1.5">
                    <Icon :name="store.icon" class="size-4" aria-hidden="true" />{{ store.label }}
                </span>
            </a>
        </div>

        <p v-if="isDone(current)" class="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
            <Icon name="ph:check-circle-fill" class="size-4" aria-hidden="true" />
            {{ $t('firstSteps.done') }}
        </p>

        <div class="mt-5 flex flex-wrap items-center gap-3">
            <button v-if="action && !isDone(current)" type="button" @click="action.run"
                class="inline-flex items-center gap-x-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0d3f61] transition-colors">
                {{ $t(`firstSteps.${role}.${current.key}.cta`) }}
                <Icon name="ph:arrow-right" class="size-4" aria-hidden="true" />
            </button>
            <button v-if="index < steps.length - 1" type="button" @click="index++"
                :class="action && !isDone(current) ? 'text-slate-600 hover:text-slate-900' : 'rounded-lg bg-primary px-4 py-2.5 font-semibold text-white hover:bg-[#0d3f61]'"
                class="text-sm transition-colors">
                {{ action && !isDone(current) ? $t('firstSteps.later') : $t('firstSteps.next') }}
            </button>
            <button v-else type="button" @click="finish"
                class="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0d3f61] transition-colors">
                {{ $t('firstSteps.finish') }}
            </button>
            <button v-if="index > 0" type="button" @click="index--" class="text-sm text-slate-500 hover:text-slate-700">
                {{ $t('firstSteps.back') }}
            </button>
        </div>

        <!-- Milo, the support chat, is one click away for anyone who gets stuck. -->
        <!-- As wide as its content, so the button sits right after the sentence. -->
        <div class="mt-6 flex w-fit max-w-full flex-wrap items-center gap-3 rounded-xl bg-ai-bg/60 py-2 pl-2 pr-2.5">
            <img src="/img/milo/milo-avatar.png" alt="" width="40" height="40"
                class="size-10 shrink-0 rounded-xl object-cover" aria-hidden="true" />
            <p class="text-sm text-slate-700">{{ $t('firstSteps.help') }}</p>
            <button type="button" @click="revealAndOpenChat()"
                class="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-ai-ink ring-1 ring-ai/40 hover:bg-ai-bg">
                <Icon name="ph:chat-circle-dots" class="size-4" aria-hidden="true" />
                {{ $t('firstSteps.askMilo') }}
            </button>
        </div>

        <ModulesUserJournalNotesModalNew :isModalOpen="noteOpen" :citizenOptions="citizens"
            :initialCitizenUuid="citizens.length === 1 ? citizens[0].value : ''"
            @close="noteOpen = false" @refreshJournal="onNoteSaved" />
    </section>
</template>

<script setup lang="ts">
import { userService } from '@/components/api/user/UserService'
import { citizenService } from '@/components/api/user/CitizenService'
import { useUserStore } from '@/store/user'
import { welcomeTourMode } from '@/composables/welcomeTour'
import { firstSteps, startIndex, stepDone, type FirstStep, type FirstStepsRole } from '@/composables/firstSteps'
import type { ChecklistStep } from '@/composables/onboardingProgress'

const props = defineProps<{ role: FirstStepsRole, greeting?: string }>()
const QRCodeVue3 = defineAsyncComponent(() => import('qrcode-vue3'))

// The same store links as the app modal on Discover.
const APP_STORES = [
    { key: 'ios', label: 'App Store', icon: 'ph:apple-logo-fill', url: 'https://apps.apple.com/ph/app/citizenone/id6737061242' },
    { key: 'android', label: 'Google Play', icon: 'ph:google-play-logo-fill', url: 'https://play.google.com/store/apps/details?id=com.aworkAS.CitizenOne&pcampaignid=web_share' },
]
// The admin's "what do you use" modal lives on Discover, which owns its state.
const emit = defineEmits<{ (e: 'openModules'): void }>()

const userStore = useUserStore() as any
const { finishFirstSteps } = useWelcomeTour()
const { revealAndOpenChat } = useObiyenChat()

const steps = computed(() => firstSteps(props.role))
const checklist = ref<ChecklistStep[]>([])
const citizens = ref<{ value: string, label: string }[]>([])
const index = ref(0)
const noteOpen = ref(false)
const finished = ref(false)
// Saved here, so done here: the checklist leaves out notes on the demo citizens,
// which are all a new account has, and the step would otherwise never turn green.
const savedHere = ref(new Set<string>())

// Shown until finished or skipped, the same marker the old tour used, so the
// landing page after sign-in (Discover or My day) follows it.
const visible = computed(() => !finished.value && welcomeTourMode(userStore.getUser) === 'tour')
const current = computed<FirstStep>(() => steps.value[index.value])

function isDone(step: FirstStep) {
    return savedHere.value.has(step.key) || stepDone(step, checklist.value)
}

const ACTIONS: Record<string, () => void> = {
    modules: () => emit('openModules'),
    firstCitizen: () => navigateTo('/citizens/new'),
    note: () => { noteOpen.value = true },
    colleagues: () => navigateTo('/employees'),
    day: () => navigateTo('/messages'),
}
const action = computed(() => {
    const run = ACTIONS[current.value.key]
    return run ? { run } : null
})

async function fetchChecklist() {
    try {
        const response: any = await userService.getOnboardingChecklist()
        const data = response?.steps ? response : response?.data
        checklist.value = Array.isArray(data?.steps) ? data.steps : []
    } catch (e) { /* an older backend: every step shows as open */ }
}

async function fetchCitizens() {
    try {
        const response: any = await citizenService.getAllCitizens({})
        citizens.value = (response?.data ?? [])
            .filter((c: any) => c?.uuid && c.uuid !== 'all-citizens')
            .map((c: any) => ({ value: c.uuid, label: [c.firstname, c.lastname].filter(Boolean).join(' '), pinned: !!c.is_pinned, departments: c.departments ?? [] }))
    } catch (e) { citizens.value = [] }
}

async function onNoteSaved() {
    noteOpen.value = false
    savedHere.value = new Set([...savedHere.value, 'note'])
    await fetchChecklist()
    if (isDone(current.value) && index.value < steps.value.length - 1) index.value++
}

async function finish() {
    finished.value = true
    await finishFirstSteps()
}

onMounted(async () => {
    if (!visible.value) return
    await Promise.all([fetchChecklist(), fetchCitizens()])
    index.value = startIndex(steps.value, checklist.value)
})
</script>
