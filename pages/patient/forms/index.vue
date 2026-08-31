<template>
    <div>
        <NuxtLayout name="patient">

            <Head>
                <Title>{{ $t('patient.nav.forms') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('patient.nav.forms') }}</template>

            <div class="mt-6 space-y-8">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <LoadingSpinner :isActive="state.isLoading">
                    <div v-if="state.forms.length === 0 && !state.isLoading">
                        <Alert type="info" :text="$t('patient.forms.empty')" />
                    </div>

                    <div v-else class="space-y-8">
                        <section>
                            <p class="mb-3 text-xs font-bold text-primary uppercase tracking-widest">
                                {{ $t('patient.forms.pending') }}
                            </p>
                            <div v-if="pending.length === 0"
                                class="bg-white rounded-2xl border border-gray-200 px-5 py-4 text-sm text-gray-400 italic">
                                {{ $t('patient.forms.noPending') }}
                            </div>
                            <div v-else class="space-y-3">
                                <div v-for="assignment in pending" :key="assignment.uuid"
                                    class="bg-white rounded-2xl border border-primary/30 px-5 py-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
                                    <div class="space-y-1.5">
                                        <p class="font-semibold text-gray-900">{{ assignment.form?.title }}</p>
                                        <p class="text-sm text-gray-500">
                                            {{ $t('patient.forms.received') }}: {{ formatDate(assignment.created_at) }}
                                        </p>
                                    </div>
                                    <FormButton type="button" buttonStyle="action"
                                        @click="navigateTo(`/patient/forms/${assignment.uuid}`)">
                                        {{ $t('patient.forms.fillOut') }}
                                    </FormButton>
                                </div>
                            </div>
                        </section>

                        <section v-if="completed.length > 0">
                            <p class="mb-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                {{ $t('patient.forms.completed') }}
                            </p>
                            <div class="space-y-3">
                                <div v-for="assignment in completed" :key="assignment.uuid"
                                    class="bg-white rounded-2xl border border-gray-200 px-5 py-4">
                                    <p class="font-semibold text-gray-900">{{ assignment.form?.title }}</p>
                                    <p class="text-sm text-gray-500">
                                        {{ $t('patient.forms.completedAt') }}: {{ formatDate(assignment.completed_at) }}
                                    </p>
                                    <span class="inline-block mt-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-100 text-green-700">
                                        {{ $t('patient.forms.returned') }}
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
import { patientFormService } from '@/components/api/patient/FormService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const state = reactive({ error: {} as Error, isLoading: false, forms: [] as any[] })

const pending = computed(() => state.forms.filter((assignment: any) => assignment.status === 'pending'))
const completed = computed(() => state.forms.filter((assignment: any) => assignment.status === 'completed'))

function formatDate(date: any) {
    return date ? moment(date).format('DD-MM-YYYY') : '-'
}

onMounted(() => fetchForms())

async function fetchForms() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await patientFormService.getForms()
        state.forms = response?.data ?? []
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}
</script>
