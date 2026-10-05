<template>
    <Modal size="3xl" :title="$t('socialWelfare.customerDepartments.import.title')" :show="props.isModalOpen"
        @close="emit('close')">
        <template #modal-body>
            <div class="space-y-4">
                <div class="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900 space-y-1">
                    <p>{{ $t('socialWelfare.customerDepartments.import.help') }}</p>
                    <p>{{ $t('socialWelfare.customerDepartments.import.helpReimport') }}</p>
                </div>

                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <LoadingSpinner :isActive="state.isBusy">
                    <!-- 1. The file -->
                    <div class="flex flex-wrap items-end gap-3">
                        <div class="space-y-1">
                            <div class="flex items-center gap-1">
                                <FormLabel :label="$t('socialWelfare.customerDepartments.import.file')" />
                                <Tooltip :text="$t('socialWelfare.customerDepartments.import.fileHelp')" wrap position="top">
                                    <Icon name="ph:info" class="w-3.5 h-3.5 text-slate-400 hover:text-primary transition" aria-hidden="true" />
                                </Tooltip>
                            </div>
                            <input ref="fileInput" type="file" accept=".xlsx,.xls,.csv,.txt" class="co-cell-input"
                                :aria-label="$t('socialWelfare.customerDepartments.import.file')"
                                :disabled="state.isBusy" @change="onFile" />
                        </div>
                        <Tooltip :text="$t('socialWelfare.customerDepartments.import.previewHelp')" wrap position="top">
                            <FormButton type="button" buttonStyle="action" :disabled="!state.file || state.isBusy" @click="preview">
                                <Icon name="ph:eye" class="size-4" aria-hidden="true" />
                                {{ $t('socialWelfare.customerDepartments.import.preview') }}
                            </FormButton>
                        </Tooltip>
                    </div>

                    <!-- 2. The preview (or, after applying, the result) -->
                    <div v-if="state.result" class="mt-5 space-y-4">
                        <p class="text-sm font-medium text-slate-900">
                            {{ state.result.dry_run
                                ? $t('socialWelfare.customerDepartments.import.previewTitle')
                                : $t('socialWelfare.customerDepartments.import.doneTitle') }}
                        </p>

                        <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
                            <div v-for="card in countCards" :key="card.key"
                                class="rounded-lg border border-surface-200 bg-white px-3 py-2">
                                <Tooltip :text="card.help" wrap position="top">
                                    <p class="text-[11px] uppercase tracking-wide text-slate-400">{{ card.label }}</p>
                                </Tooltip>
                                <p class="text-xl font-semibold" :class="card.tone">{{ card.value }}</p>
                            </div>
                        </div>

                        <p v-if="state.result.payment_terms_added?.length" class="text-[13px] text-slate-600">
                            {{ $t(state.result.dry_run ? 'socialWelfare.customerDepartments.import.termsWillBeAdded' : 'socialWelfare.customerDepartments.import.termsAdded',
                                { days: state.result.payment_terms_added.join(', ') }) }}
                        </p>
                        <p v-if="state.result.unmatched_municipalities?.length" class="text-[13px] text-amber-700">
                            {{ $t('socialWelfare.customerDepartments.import.unmatchedMunicipalities',
                                { names: state.result.unmatched_municipalities.join(', ') }) }}
                        </p>
                        <p v-if="state.result.ignored_columns?.length" class="text-[12px] text-slate-400">
                            {{ $t('socialWelfare.customerDepartments.import.ignoredColumns',
                                { names: state.result.ignored_columns.join(', ') }) }}
                        </p>

                        <div class="max-h-96 overflow-auto rounded-lg border border-surface-200">
                            <table class="w-full">
                                <thead class="sticky top-0 bg-slate-50 border-b border-surface-200">
                                    <tr>
                                        <th class="co-th">{{ $t('socialWelfare.customerDepartments.import.row') }}</th>
                                        <th class="co-th">{{ $t('socialWelfare.customerDepartments.externalId') }}</th>
                                        <th class="co-th">{{ $t('socialWelfare.customerDepartments.name') }}</th>
                                        <th class="co-th">{{ $t('socialWelfare.customerDepartments.import.action') }}</th>
                                        <th class="co-th">{{ $t('socialWelfare.customerDepartments.import.notes') }}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="row in state.result.rows" :key="row.row"
                                        class="border-b border-surface-200 last:border-0 align-top">
                                        <td class="co-td tabular-nums text-slate-500">{{ row.row }}</td>
                                        <td class="co-td text-slate-500">{{ row.external_id || '-' }}</td>
                                        <td class="co-td">
                                            <p class="font-medium text-slate-900">{{ row.name || '-' }}</p>
                                            <p v-if="row.customer_name" class="text-[12px] text-slate-400">{{ row.customer_name }}</p>
                                        </td>
                                        <td class="co-td">
                                            <Tooltip :text="$t(`socialWelfare.customerDepartments.import.actionHelp.${row.action}`)" wrap position="left">
                                                <span class="co-badge text-[11px]" :class="actionClass(row.action)">
                                                    {{ $t(`socialWelfare.customerDepartments.import.actions.${row.action}`) }}
                                                </span>
                                            </Tooltip>
                                        </td>
                                        <td class="co-td text-[12px]">
                                            <p v-for="issue in row.errors" :key="`e-${issue.code}`" class="text-red-700">{{ issue.message }}</p>
                                            <p v-for="issue in row.warnings" :key="`w-${issue.code}`" class="text-amber-700">{{ issue.message }}</p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </LoadingSpinner>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <FormButton type="button" buttonStyle="cancel" @click="emit('close')">
                        {{ state.result && !state.result.dry_run ? $t('close') : $t('cancel') }}
                    </FormButton>
                    <Tooltip v-if="state.result?.dry_run" :text="$t('socialWelfare.customerDepartments.import.applyHelp')" wrap position="top">
                        <FormButton type="button" buttonStyle="primary" class="w-full" :disabled="!canApply || state.isBusy" @click="apply">
                            {{ $t('socialWelfare.customerDepartments.import.apply', { count: toApply }) }}
                        </FormButton>
                    </Tooltip>
                </div>
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { socialWelfareService } from '@/components/api/user/SocialWelfareService'
import { applyCount, isImportFile, MAX_IMPORT_BYTES } from '@/composables/customerDepartment'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'
import type { ImportResult } from '@/types/customer-department'

const props = defineProps({
    isModalOpen: { type: Boolean, required: true },
})
const emit = defineEmits(['close', 'imported'])

const { t } = useI18n()
const { successAlert } = useAlert()
const fileInput = ref<HTMLInputElement | null>(null)

const state = reactive({
    error: {} as Error,
    isBusy: false,
    file: null as File | null,
    result: null as ImportResult | null,
})

watch(() => props.isModalOpen, (open) => {
    if (!open) return

    state.error = {} as Error
    state.file = null
    state.result = null
    if (fileInput.value) fileInput.value.value = ''
})

const toApply = computed(() => applyCount(state.result?.counts))
const canApply = computed(() => toApply.value > 0)

const countCards = computed(() => {
    const c = state.result?.counts
    const prefix = 'socialWelfare.customerDepartments.import'

    return [
        { key: 'create', label: t(`${prefix}.actions.create`), help: t(`${prefix}.actionHelp.create`), value: c?.create ?? 0, tone: 'text-green-700' },
        { key: 'update', label: t(`${prefix}.actions.update`), help: t(`${prefix}.actionHelp.update`), value: c?.update ?? 0, tone: 'text-slate-900' },
        { key: 'skip', label: t(`${prefix}.actions.skip`), help: t(`${prefix}.actionHelp.skip`), value: c?.skip ?? 0, tone: 'text-slate-500' },
        { key: 'inactive', label: t(`${prefix}.inactiveCount`), help: t(`${prefix}.inactiveCountHelp`), value: c?.inactive ?? 0, tone: 'text-slate-500' },
        { key: 'warnings', label: t(`${prefix}.warnings`), help: t(`${prefix}.warningsHelp`), value: c?.warnings ?? 0, tone: (c?.warnings ?? 0) > 0 ? 'text-amber-700' : 'text-slate-900' },
        { key: 'errors', label: t(`${prefix}.errors`), help: t(`${prefix}.errorsHelp`), value: c?.errors ?? 0, tone: (c?.errors ?? 0) > 0 ? 'text-red-700' : 'text-slate-900' },
    ]
})

function actionClass(action: string): string {
    if (action === 'create') return 'co-badge-green'
    if (action === 'update') return 'co-badge-blue'

    return 'co-badge-gray'
}

function onFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null

    state.error = {} as Error
    state.result = null
    state.file = null

    if (!file) return

    if (!isImportFile(file.name)) {
        state.error = { message: t('socialWelfare.customerDepartments.import.badType') } as Error

        return
    }

    if (file.size > MAX_IMPORT_BYTES) {
        state.error = { message: t('socialWelfare.customerDepartments.import.tooBig') } as Error

        return
    }

    state.file = file
}

async function run(dryRun: boolean) {
    if (!state.file) return

    state.error = {} as Error
    state.isBusy = true
    try {
        const response = await socialWelfareService.importCustomerDepartments(state.file, dryRun)
        state.result = response?.data ?? null

        return true
    } catch (error: any) {
        state.error = error

        return false
    } finally {
        state.isBusy = false
    }
}

function preview() {
    return run(true)
}

async function apply() {
    if (await run(false)) {
        successAlert(`${t('alert.success')}!`, t('socialWelfare.customerDepartments.import.done', { count: toApply.value }))
        emit('imported')
    }
}
</script>
