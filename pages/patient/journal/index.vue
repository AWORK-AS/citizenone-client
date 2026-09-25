<template>
    <div>
        <NuxtLayout name="patient">

            <Head>
                <Title>{{ $t('patient.nav.journal') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('patient.nav.journal') }}</template>

            <div class="mt-2 space-y-5">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <p class="text-sm text-gray-600 max-w-2xl">{{ $t('patient.journal.intro') }}</p>

                <LoadingSpinner :isActive="state.isLoading">
                    <div v-if="state.journals.length === 0 && !state.isLoading">
                        <Alert type="info" :text="$t('patient.journal.empty')" />
                    </div>

                    <div v-else class="space-y-3">
                        <article v-for="journal in state.journals" :key="journal.uuid"
                            class="bg-white rounded-2xl border border-gray-200 px-5 py-4">
                            <div class="flex flex-wrap items-center justify-between gap-2">
                                <p class="font-semibold text-gray-900">{{ journal.title }}</p>
                                <p class="text-sm text-gray-500">{{ formatDate(journal.date) }}</p>
                            </div>
                            <p class="mt-1 text-sm text-gray-500" v-if="journal.user">
                                {{ journal.user?.firstname }} {{ journal.user?.lastname }}
                                <span v-if="formatJobTitles(journal.user)">({{ formatJobTitles(journal.user) }})</span>
                            </p>
                            <div class="mt-3 text-sm text-gray-700 journal-content" v-html="journal.content"></div>
                        </article>
                    </div>
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { patientJournalService } from '@/components/api/patient/JournalService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()

const state = reactive({
    error: {} as Error,
    isLoading: false,
    journals: [] as any[],
})

function formatDate(date: any) {
    return date ? moment(date).format('DD-MM-YYYY') : '-'
}

onMounted(() => fetchJournals())

async function fetchJournals() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await patientJournalService.getJournals({})
        state.journals = response?.data ?? []
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}
</script>
