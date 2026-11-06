<template>
    <!-- The intervention hours of a note that already exists. Behind its own
         right (update_citizen_journal_care_hours), and saved on their own with
         the button below, so the note's autosave never touches the hours. -->
    <div class="space-y-2 rounded-md border border-gray-200 p-3" data-testid="journal-edit-care-hours">
        <p class="text-sm font-medium">{{ $t('citizens.citizenJournals.form.careHours.editTitle') }}</p>
        <LoadingSpinner :isActive="state.isLoading">
            <p v-if="state.lines.length === 0" class="text-sm text-gray-500">
                {{ $t('citizens.citizenJournals.form.careHours.none') }}
            </p>
            <div v-for="(line, i) in state.lines" :key="line.key"
                class="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_2.25rem] gap-x-3 gap-y-2 items-start"
                :class="line.removed && 'opacity-50'">
                <div class="space-y-1">
                    <FormLabel :for="`edit_care_hours_date_${i}`" :label="$t('citizens.citizenJournals.form.careHours.date')" />
                    <FormDateField v-if="!line.paidOut && !line.removed" :id="`edit_care_hours_date_${i}`"
                        :name="`edit_care_hours_date_${i}`" v-model="line.date" />
                    <p v-else class="py-2 text-sm">{{ line.date }}</p>
                </div>
                <div class="space-y-1">
                    <FormLabel :for="`edit_care_hours_start_${i}`" :label="$t('citizens.citizenJournals.form.careHours.timeStart')" />
                    <FormTimeField v-if="!line.paidOut && !line.removed" :id="`edit_care_hours_start_${i}`"
                        :name="`edit_care_hours_start_${i}`" v-model:value="line.start" />
                    <p v-else class="py-2 text-sm">{{ line.start }}</p>
                    <FormError :error="lineError(line, 'date_time_start')" />
                </div>
                <div class="space-y-1">
                    <FormLabel :for="`edit_care_hours_end_${i}`" :label="$t('citizens.citizenJournals.form.careHours.timeEnd')" />
                    <FormTimeField v-if="!line.paidOut && !line.removed" :id="`edit_care_hours_end_${i}`"
                        :name="`edit_care_hours_end_${i}`" v-model:value="line.end" />
                    <p v-else class="py-2 text-sm">{{ line.end }}</p>
                    <FormError :error="lineError(line, 'date_time_end')" />
                </div>
                <div class="space-y-1">
                    <template v-if="typeOptions.length > 0">
                        <FormLabel :for="`edit_care_hours_type_${i}`" :label="$t('citizens.interventionHours.form.hourType')" />
                        <FormSelect v-if="!line.paidOut && !line.removed" :id="`edit_care_hours_type_${i}`"
                            :options="typeOptions" :searchable="false" :canClear="false" :canDeselect="false"
                            v-model="line.type" />
                        <p v-else class="py-2 text-sm">{{ typeOptions.find((o) => o.value === line.type)?.label ?? '' }}</p>
                        <FormError :error="lineError(line, 'contract_hour_type_uuid')" />
                    </template>
                    <p v-if="line.paidOut" class="text-xs text-gray-500">{{ $t('citizens.citizenJournals.form.careHours.paidOut') }}</p>
                    <p v-else-if="line.removed" class="text-xs text-red-600">{{ $t('citizens.citizenJournals.form.careHours.removed') }}</p>
                    <FormError :error="lineError(line, 'uuid') || removeError(line)" />
                </div>
                <div class="md:pt-6">
                    <button v-if="!line.paidOut" type="button"
                        class="flex size-9 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-red-600"
                        :aria-label="line.removed ? $t('citizens.citizenJournals.form.careHours.undoRemove') : $t('citizens.citizenJournals.form.careHours.removeLine')"
                        :title="line.removed ? $t('citizens.citizenJournals.form.careHours.undoRemove') : $t('citizens.citizenJournals.form.careHours.removeLine')"
                        @click="toggleRemove(i)">
                        <Icon :name="line.removed ? 'ph:arrow-counter-clockwise' : 'ph:trash'" class="h-4 w-4" aria-hidden="true" />
                    </button>
                </div>
            </div>
            <div class="flex flex-wrap items-center gap-3 pt-1">
                <button v-if="activeLineCount < MAX_LINES" type="button"
                    class="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    @click="addLine">
                    <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                    {{ $t('citizens.citizenJournals.form.careHours.addLine') }}
                </button>
                <FormButton type="button" buttonStyle="secondary" buttonSize="xs" class="ms-auto"
                    :disabled="!hasChanges || state.isSaving" @click="save">
                    {{ $t('citizens.citizenJournals.form.careHours.save') }}
                </FormButton>
            </div>
            <FormError :error="state.message" />
            <p class="text-xs text-gray-500">
                <template v-if="hasChanges">{{ $t('citizens.citizenJournals.form.careHours.unsaved') }}</template>
                {{ $t('citizens.citizenJournals.form.careHours.editHelp') }}
            </p>
        </LoadingSpinner>
    </div>
</template>

<script setup lang="ts">
import { journalService } from '@/components/api/user/JournalService'
import { useCareHourTypes } from '@/composables/careHourTypeList'
import {
    defaultHourTypeUuid, extraLineHourTypeUuid, hourTypeChoices, journalCareHoursEditRequest, noteCareHoursLine,
    type NoteCareHoursLine,
} from '@/composables/careHourTypes'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'

const MAX_LINES = 10

const props = defineProps({
    journalUuid: {
        type: String,
        required: true,
    },
    /** Where a new line starts: the visit date, else the note's date. */
    defaultDate: {
        type: String,
        default: '',
    },
})

const { t } = useI18n()
const { successAlert } = useAlert()
const { types, loadHourTypes } = useCareHourTypes()
const typeOptions = computed(() => hourTypeChoices(types.value))

const state = reactive({
    isLoading: false,
    isSaving: false,
    lines: [] as NoteCareHoursLine[],
    errors: {} as Record<string, string[]>,
    message: '' as string,
})

let lineKey = 0
// The keys of the lines in the order they were sent, so the server's
// care_hours.{n}.* and remove_care_hour_uuids.{n} errors land on their line.
let sentKeys: number[] = []
let removeKeys: number[] = []

const activeLineCount = computed(() => state.lines.filter((line) => !line.removed).length)
const pending = computed(() => journalCareHoursEditRequest(state.lines, typeOptions.value.length > 0))
const hasChanges = computed(() => pending.value.care_hours.length > 0 || pending.value.remove_care_hour_uuids.length > 0)

function lineError(line: NoteCareHoursLine, field: string): string | undefined {
    const index = sentKeys.indexOf(line.key)
    return index === -1 ? undefined : state.errors[`care_hours.${index}.${field}`]?.[0]
}

function removeError(line: NoteCareHoursLine): string | undefined {
    const index = removeKeys.indexOf(line.key)
    return index === -1 ? undefined : state.errors[`remove_care_hour_uuids.${index}`]?.[0]
}

function setLines(rows: any[]) {
    state.lines = (rows ?? []).map((row: any) => noteCareHoursLine(++lineKey, row))
}

async function load() {
    if (!props.journalUuid) return
    state.isLoading = true
    try {
        const [response] = await Promise.all([journalService.getJournalCareHours(props.journalUuid), loadHourTypes()])
        setLines(response?.data ?? [])
    } catch (error: any) {
        state.message = error?.message ?? ''
    }
    state.isLoading = false
}

function addLine() {
    if (activeLineCount.value >= MAX_LINES) return
    const last = state.lines[state.lines.length - 1]
    state.lines.push({
        key: ++lineKey,
        uuid: null,
        date: last?.date || props.defaultDate || '',
        start: last?.end ?? '',
        end: '',
        type: state.lines.length === 0 ? defaultHourTypeUuid(types.value) : extraLineHourTypeUuid(types.value),
        removed: false,
        paidOut: false,
        original: null,
    })
}

function toggleRemove(index: number) {
    const line = state.lines[index]
    if (!line || line.paidOut) return
    // A line not saved yet just goes.
    if (!line.uuid) {
        state.lines.splice(index, 1)
        return
    }
    line.removed = !line.removed
}

async function save() {
    if (!hasChanges.value || state.isSaving) return
    const request = pending.value
    sentKeys = request.keys
    removeKeys = request.removeKeys
    state.errors = {}
    state.message = ''
    state.isSaving = true
    try {
        const response = await journalService.updateJournalCareHours(props.journalUuid, {
            care_hours: request.care_hours,
            remove_care_hour_uuids: request.remove_care_hour_uuids,
        })
        setLines(response?.data ?? [])
        sentKeys = []
        removeKeys = []
        successAlert(`${t('alert.success')}!`, `${t('citizens.citizenJournals.form.careHours.saved')}.`)
    } catch (error: any) {
        state.errors = error?.errors ?? {}
        state.message = Object.keys(state.errors).length > 0 ? '' : (error?.message ?? '')
    }
    state.isSaving = false
}

onMounted(load)
watch(() => props.journalUuid, () => load())
</script>
