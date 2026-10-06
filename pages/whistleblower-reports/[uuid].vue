<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ state.report?.reference ?? $t('whistleblower.inbox.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('whistleblower.inbox.title') }}</template>

            <div class="mt-6 max-w-4xl space-y-6">
                <NuxtLink to="/whistleblower-reports" class="flex w-fit items-center gap-x-2 text-sm text-slate-600 hover:text-primary">
                    <Icon name="ph:arrow-left" class="h-4 w-4" aria-hidden="true" />
                    {{ $t('whistleblower.detail.back') }}
                </NuxtLink>

                <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />

                <LoadingSpinner :isActive="state.isLoading">
                    <div v-if="state.report" class="space-y-6">
                        <!-- The report -->
                        <section class="card">
                            <div class="card-header flex-wrap gap-3">
                                <div class="min-w-0">
                                    <p class="font-mono text-xs text-slate-500">{{ state.report.reference }}</p>
                                    <h2 class="text-lg font-semibold text-slate-900">{{ state.report.subject }}</h2>
                                    <p class="text-xs text-slate-500">
                                        {{ $t(`whistleblower.categories.${state.report.category}`) }} ·
                                        {{ $t('whistleblower.detail.receivedOn', { date: formatDateToReadable(state.report.received_on) }) }}
                                    </p>
                                </div>
                                <ModulesUserWhistleblowerStatusBadge :status="state.report.status" />
                            </div>
                            <div class="card-body space-y-4">
                                <p class="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{{ state.report.description }}</p>
                                <div class="rounded-lg bg-surface-50 px-4 py-3 text-sm">
                                    <p v-if="state.report.is_anonymous" class="flex items-center gap-x-2 text-slate-600">
                                        <Icon name="ph:user-circle-dashed" class="h-4 w-4" aria-hidden="true" />
                                        {{ $t('whistleblower.detail.anonymous') }}
                                    </p>
                                    <template v-else>
                                        <p class="font-medium text-slate-900">{{ $t('whistleblower.detail.reporter') }}</p>
                                        <p class="text-slate-700">{{ state.report.reporter_name || '-' }}</p>
                                        <p class="text-slate-700">{{ state.report.reporter_contact || '-' }}</p>
                                    </template>
                                </div>
                            </div>
                        </section>

                        <!-- Handling -->
                        <section class="card card-body space-y-4">
                            <div class="flex flex-wrap items-end gap-3">
                                <div class="w-full sm:w-64">
                                    <FormLabel :label="$t('whistleblower.detail.status')" />
                                    <FormSelect v-model="state.status" :options="statusOptions" :canClear="false"
                                        :canDeselect="false" />
                                </div>
                                <FormButton buttonStyle="primary" :disabled="state.isSaving || state.status === state.report.status"
                                    @click="saveStatus">
                                    {{ $t('whistleblower.detail.updateStatus') }}
                                </FormButton>
                            </div>
                            <p class="text-xs text-slate-500">{{ $t('whistleblower.detail.deadlines') }}</p>
                        </section>

                        <!-- Notes and history, handlers only -->
                        <section class="card">
                            <div class="card-header">
                                <h3 class="text-sm font-semibold text-slate-900">{{ $t('whistleblower.detail.history') }}</h3>
                            </div>
                            <div class="card-body space-y-4">
                                <p class="text-xs text-slate-500">{{ $t('whistleblower.detail.historyHelp') }}</p>
                                <ul v-if="state.report.entries?.length" class="space-y-3">
                                    <li v-for="entry in state.report.entries" :key="entry.uuid" class="flex gap-x-3 text-sm">
                                        <Icon :name="entry.type === 'note' ? 'ph:note' : 'ph:arrows-left-right'"
                                            class="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                                        <div class="min-w-0">
                                            <p class="text-xs text-slate-500">
                                                {{ entry.user?.name ?? $t('whistleblower.detail.formerHandler') }} ·
                                                {{ formatDateTimeToReadable(entry.created_at) }}
                                            </p>
                                            <p v-if="entry.type === 'note'" class="whitespace-pre-wrap text-slate-800">{{ entry.body }}</p>
                                            <p v-else class="text-slate-800">
                                                {{ $t('whistleblower.detail.statusChanged', {
                                                    from: $t(`whistleblower.statuses.${entry.status_from}`),
                                                    to: $t(`whistleblower.statuses.${entry.status_to}`),
                                                }) }}
                                            </p>
                                        </div>
                                    </li>
                                </ul>
                                <div>
                                    <FormLabel for="wb-note" :label="$t('whistleblower.detail.addNote')" />
                                    <!-- Keyed: the text area only shows its initial value, so a new one
                                         is mounted to clear it after a save. -->
                                    <FormTextArea :key="state.noteKey" name="wb-note" v-model="state.note" :rows="3" placeholder="" />
                                    <div class="mt-2 flex justify-end">
                                        <FormButton buttonStyle="action" :disabled="state.isSaving || !state.note.trim()" @click="saveNote">
                                            {{ $t('whistleblower.detail.saveNote') }}
                                        </FormButton>
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
import { whistleblowerService } from '@/components/api/user/WhistleblowerService'
import { useWhistleblowerHandlerGuard } from '@/composables/useWhistleblowerHandlerGuard'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const { formatDateToReadable, formatDateTimeToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
useWhistleblowerHandlerGuard()

const uuid = route.params.uuid as string
const breadcrumbLinks = [{ name: 'whistleblower.inbox.title', translate: true, href: '/whistleblower-reports' }]

const state = reactive({
    isLoading: true,
    isSaving: false,
    error: {} as any,
    report: null as any,
    status: '',
    note: '',
    noteKey: 0,
})

const statusOptions = computed(() => ['received', 'acknowledged', 'investigating', 'closed']
    .map((value) => ({ value, label: t(`whistleblower.statuses.${value}`) })))

onMounted(fetchReport)

function apply(report: any) {
    state.report = report
    state.status = report?.status ?? ''
}

async function fetchReport() {
    state.isLoading = true
    try {
        const response = await whistleblowerService.getReport(uuid)
        apply(response?.data)
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function saveStatus() {
    state.error = {}
    state.isSaving = true
    try {
        const response = await whistleblowerService.changeStatus(uuid, state.status)
        if (response?.data) {
            apply(response.data)
            successAlert(`${t('alert.success')}!`, `${t('whistleblower.detail.statusSaved')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}

async function saveNote() {
    state.error = {}
    state.isSaving = true
    try {
        const response = await whistleblowerService.addNote(uuid, state.note.trim())
        if (response?.data) {
            apply(response.data)
            state.note = ''
            state.noteKey++
        }
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}
</script>
