<template>
    <div class="px-4 py-5 sm:p-6 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg space-y-4">
        <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
                <h3 class="text-base font-semibold text-gray-900">{{ $t('citizens.toothChart.examinations.title') }}</h3>
                <p class="text-sm text-gray-500">{{ $t('citizens.toothChart.examinations.help') }}</p>
            </div>
            <FormButton buttonStyle="action" buttonSize="xs" @click="state.isFormOpen = !state.isFormOpen">
                <Icon name="ph:clipboard-text" class="size-4" />
                {{ $t('citizens.toothChart.examinations.record') }}
            </FormButton>
        </div>

        <Alert type="danger" :text="state.error" v-if="state.error" />

        <div class="rounded-md border border-gray-200 p-3 space-y-3" v-if="state.isFormOpen">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="space-y-1">
                    <FormLabel for="examined_at" :label="$t('citizens.toothChart.examinations.examinedAt')" />
                    <FormDateField id="examined_at" name="examined_at" v-model="state.form.examined_at"
                        :placeholder="$t('citizens.toothChart.examinations.examinedAt')" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="examination_note" :label="$t('citizens.toothChart.panel.notePlaceholder')" />
                    <FormTextField id="examination_note" name="examination_note" v-model="state.form.note"
                        :placeholder="$t('citizens.toothChart.panel.notePlaceholder')" />
                </div>
            </div>
            <p class="text-xs text-gray-500">{{ $t('citizens.toothChart.examinations.snapshotNote') }}</p>
            <div class="flex justify-end gap-2">
                <FormButton buttonStyle="action" buttonSize="xs" @click="state.isFormOpen = false">
                    {{ $t('cancel') }}
                </FormButton>
                <FormButton buttonStyle="primary" buttonSize="xs" @click="save" :disabled="state.isSaving">
                    {{ $t('save') }}
                </FormButton>
            </div>
        </div>

        <LoadingSpinner :isActive="state.isLoading">
            <p class="text-sm text-gray-500" v-if="state.examinations.length === 0">
                {{ $t('citizens.toothChart.examinations.empty') }}
            </p>

            <div class="overflow-x-auto" v-else>
                <table class="min-w-full text-sm">
                    <thead>
                        <tr class="text-left text-xs uppercase tracking-wide text-gray-500">
                            <th class="py-1 pr-3">{{ $t('citizens.toothChart.examinations.examinedAt') }}</th>
                            <th class="py-1 pr-3">{{ $t('citizens.toothChart.examinations.age') }}</th>
                            <th class="py-1 pr-3">{{ $t('citizens.toothChart.examinations.primary') }}</th>
                            <th class="py-1 pr-3">{{ $t('citizens.toothChart.examinations.permanent') }}</th>
                            <th class="py-1 pr-3">{{ $t('citizens.toothChart.panel.notePlaceholder') }}</th>
                            <th class="py-1 w-8"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="examination in state.examinations" :key="examination.uuid"
                            class="border-t border-gray-100 align-top">
                            <td class="py-1.5 pr-3 whitespace-nowrap">{{ formatDate(examination.examined_at) }}</td>
                            <td class="py-1.5 pr-3 whitespace-nowrap">
                                {{ examination.age_at_examination ?? '' }}
                                <Badge type="active" v-if="examination.is_scor_cohort" class="ml-1">
                                    {{ $t('citizens.toothChart.examinations.scorCohort') }}
                                </Badge>
                            </td>
                            <td class="py-1.5 pr-3 tabular-nums whitespace-nowrap">
                                dmf-t {{ examination.primary.dmft }} / dmf-s {{ examination.primary.dmfs }}
                                <span class="text-gray-400">
                                    (d {{ examination.primary.d }}, m {{ examination.primary.m }},
                                    f {{ examination.primary.f }})
                                </span>
                            </td>
                            <td class="py-1.5 pr-3 tabular-nums whitespace-nowrap">
                                DMF-T {{ examination.permanent.dmft }} / DMF-S {{ examination.permanent.dmfs }}
                                <span class="text-gray-400">
                                    (D {{ examination.permanent.d }}, M {{ examination.permanent.m }},
                                    F {{ examination.permanent.f }})
                                </span>
                            </td>
                            <td class="py-1.5 pr-3">{{ examination.note }}</td>
                            <td class="py-1.5">
                                <button type="button" class="text-gray-400 hover:text-red-600" :aria-label="$t('delete')"
                                    @click="remove(examination)">
                                    <Icon name="ph:trash" class="size-4" />
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </LoadingSpinner>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { dentalExaminationService } from '@/components/api/user/DentalExaminationService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'

const props = defineProps<{ citizenUuid: string }>()

const { t } = useI18n()
const { successAlert } = useAlert()

const state = reactive({
    examinations: [] as any[],
    form: { examined_at: '', note: '' },
    isFormOpen: false,
    isLoading: true,
    isSaving: false,
    error: '',
})

function formatDate(date: string): string {
    return date ? moment(date).format('DD.MM.YYYY') : ''
}

async function load() {
    state.error = ''

    try {
        const response = await dentalExaminationService.getExaminations(props.citizenUuid)
        state.examinations = response?.data || []
    } catch (error: any) {
        state.error = error?.message || ''
    } finally {
        state.isLoading = false
    }
}

async function save() {
    state.isSaving = true
    state.error = ''

    try {
        await dentalExaminationService.createExamination(props.citizenUuid, {
            examined_at: state.form.examined_at || null,
            note: state.form.note || null,
        })

        successAlert(`${t('alert.success')}!`, `${t('citizens.toothChart.examinations.saved')}.`)
        state.form = { examined_at: '', note: '' }
        state.isFormOpen = false
        await load()
    } catch (error: any) {
        state.error = error?.message || ''
    } finally {
        state.isSaving = false
    }
}

async function remove(examination: any) {
    state.error = ''

    try {
        await dentalExaminationService.deleteExamination(examination.uuid)
        await load()
    } catch (error: any) {
        state.error = error?.message || ''
    }
}

onMounted(() => load())
</script>
