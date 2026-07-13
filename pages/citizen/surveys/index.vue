<template>
    <div>
        <NuxtLayout name="citizen">

            <Head>
                <Title>{{ $t('surveys.citizen.mySurveys') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('surveys.citizen.mySurveys') }}</template>

            <div class="mt-6 space-y-8">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <LoadingSpinner :isActive="state.isLoading">
                    <div v-if="state.surveys.length === 0 && !state.isLoading">
                        <Alert type="info" :text="$t('theListIsEmpty')" />
                    </div>

                    <div v-else class="space-y-8">
                        <section>
                            <p class="mb-3 text-xs font-bold text-primary uppercase tracking-widest">
                                {{ $t('surveys.citizen.pending') }}
                            </p>
                            <div v-if="pending.length === 0"
                                class="bg-white rounded-2xl border border-gray-200 px-5 py-4 text-sm text-gray-400 italic">
                                {{ $t('surveys.citizen.noPending') }}
                            </div>
                            <div v-else class="space-y-3">
                                <div v-for="s in pending" :key="s.uuid"
                                    class="bg-white rounded-2xl border border-primary/30 px-5 py-4 flex items-center justify-between gap-4 shadow-sm">
                                    <div class="space-y-1.5">
                                        <p class="font-semibold text-gray-900">{{ s.survey?.title }}</p>
                                        <p class="text-sm text-gray-500">{{ $t('surveys.citizen.received') }}: {{ formatDate(s.created_at) }}</p>
                                    </div>
                                    <FormButton type="button" buttonStyle="action"
                                        @click="navigateTo(`/citizen/surveys/${s.uuid}`)">
                                        {{ $t('surveys.citizen.fillOut') }}
                                    </FormButton>
                                </div>
                            </div>
                        </section>

                        <section v-if="completed.length > 0">
                            <p class="mb-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                {{ $t('surveys.citizen.completed') }}
                            </p>
                            <div class="space-y-3">
                                <div v-for="s in completed" :key="s.uuid"
                                    class="bg-white rounded-2xl border border-gray-200 px-5 py-4">
                                    <p class="font-semibold text-gray-900">{{ s.survey?.title }}</p>
                                    <p class="text-sm text-gray-500">{{ $t('surveys.citizen.completedAt') }}: {{ formatDate(s.completed_at) }}</p>
                                    <span class="inline-block mt-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-700">
                                        {{ $t('surveys.citizen.returned') }}
                                    </span>
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
const state = reactive({ error: {} as Error, isLoading: false, surveys: [] as any[] })

const pending = computed(() => state.surveys.filter((s: any) => s.status === 'pending'))
const completed = computed(() => state.surveys.filter((s: any) => s.status === 'completed'))

function formatDate(d: any) { return d ? moment(d).format('DD-MM-YYYY') : '-' }

onMounted(() => fetchSurveys())

async function fetchSurveys() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await citizenSurveyService.getSurveys()
        if (response?.data) state.surveys = response.data
    } catch (error: any) { state.error = error }
    state.isLoading = false
}
</script>
