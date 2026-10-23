<template>
    <!--
        The patient has not answered a questionnaire the clinic sent. Shown on the journal, where staff look,
        instead of inside "New note" (Trium: the questions there pushed the note itself out of view).
    -->
    <div v-if="state.pending.length > 0" role="status" data-testid="journal-pending-surveys-warning"
        class="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
        <div class="flex items-start gap-2 text-sm text-amber-900">
            <Icon name="ph:warning" class="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden="true" />
            <div>
                <p class="font-semibold">{{ $t('citizens.citizenJournals.form.pendingSurveysWarningTitle') }}</p>
                <p>{{ $t('citizens.citizenJournals.form.pendingSurveysWarningText', { titles: titles }) }}</p>
            </div>
        </div>
        <NuxtLink :to="`/citizens/${props.citizenUuid}/surveys`"
            class="text-sm font-medium text-amber-900 underline hover:text-amber-700">
            {{ $t('citizens.citizenJournals.form.pendingSurveysWarningOpen') }}
        </NuxtLink>
    </div>
</template>

<script setup lang="ts">
import { surveyService } from '@/components/api/user/SurveyService'
import { useUserStore } from '@/store/user'

const props = defineProps({
    citizenUuid: {
        type: String,
        required: true,
    },
})

const userStore = useUserStore() as any

const state = reactive({
    pending: [] as any[],
})

// The same questionnaires "New note" offers to fill in: sent to the patient, not answered, not tied to a note.
const titles = computed(() => state.pending.map((assignment: any) => assignment?.survey?.title).filter(Boolean).join(', '))

onMounted(fetchPending)

async function fetchPending() {
    if (!props.citizenUuid || userStore.getUser?.is_surveys_active === false) return
    try {
        const response = await surveyService.getCitizenAssignments(props.citizenUuid)
        state.pending = (response?.data ?? []).filter((assignment: any) => assignment?.status === 'pending' && !assignment?.linked_to)
    } catch {
        // A warning only; the journal works without it.
        state.pending = []
    }
}

defineExpose({ refresh: fetchPending })
</script>
