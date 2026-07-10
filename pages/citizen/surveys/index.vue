<template>
    <div>
        <NuxtLayout name="citizen">

            <Head>
                <Title>{{ $t('surveys.mySurveys') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('surveys.mySurveys') }}</template>

            <div class="mt-6 space-y-8">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <LoadingSpinner :isActive="state.isLoading">
                    <div v-if="state.surveys.length === 0 && !state.isLoading">
                        <Alert type="info" :text="$t('theListIsEmpty')" />
                    </div>

                    <div v-else class="space-y-8">
                        <!-- Pending surveys -->
                        <section>
                            <p class="mb-3 text-xs font-bold text-primary uppercase tracking-widest">
                                {{ $t('surveys.pending') }}
                            </p>
                            <div v-if="pendingSurveys.length === 0"
                                class="bg-white rounded-2xl border border-gray-200 px-5 py-4 text-sm text-gray-400 italic">
                                {{ $t('surveys.noPendingSurveys') }}
                            </div>
                            <div v-else class="space-y-3">
                                <div v-for="survey in pendingSurveys" :key="survey.uuid"
                                    class="bg-white rounded-2xl border border-primary/30 px-5 py-4 flex items-center justify-between gap-4 shadow-sm">
                                    <div class="space-y-1.5">
                                        <p class="font-semibold text-gray-900">{{ survey.form?.title }}</p>
                                        <p class="text-sm text-gray-500">
                                            {{ $t('surveys.received') }}: {{ formatDate(survey.created_at) }}
                                        </p>
                                    </div>
                                    <div class="flex gap-2 shrink-0">
                                        <FormButton type="button" buttonStyle="action"
                                            @click="navigateTo(`/citizen/surveys/${survey.uuid}`)">
                                            {{ $t('surveys.fillOut') }}
                                        </FormButton>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <!-- Completed surveys -->
                        <section v-if="completedSurveys.length > 0">
                            <p class="mb-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                {{ $t('surveys.completed') }}
                            </p>
                            <div class="space-y-3">
                                <div v-for="survey in completedSurveys" :key="survey.uuid"
                                    class="bg-white rounded-2xl border border-gray-200 px-5 py-4 flex items-center justify-between gap-4">
                                    <div class="space-y-1.5">
                                        <p class="font-semibold text-gray-900">{{ survey.form?.title }}</p>
                                        <p class="text-sm text-gray-500">
                                            {{ $t('surveys.completedAt') }}: {{ formatDate(survey.completed_at) }}
                                        </p>
                                        <span
                                            class="inline-block text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-700">
                                            {{ $t('surveys.returned') }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { citizenSurveyService } from '@/components/api/citizen/SurveyService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()

const state = reactive({
    error: {} as Error,
    isLoading: false,
    surveys: [] as any[],
})

const pendingSurveys = computed(() => state.surveys.filter((survey: any) => survey.status === 'pending'))
const completedSurveys = computed(() => state.surveys.filter((survey: any) => survey.status === 'completed'))

function formatDate(date: any) {
    return date ? moment(date).format('DD-MM-YYYY') : '-'
}

onMounted(() => {
    fetchSurveys()
})

async function fetchSurveys() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await citizenSurveyService.getSurveys()
        if (response?.data) {
            state.surveys = response.data
        }
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}
</script>
