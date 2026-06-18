<template>
    <div>
        <Modal size="lg" :title="$t('import.modal.title')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <Alert type="danger" :text="state.error" v-if="state.error" />
                <LoadingSpinner :isActive="state.isLoading">

                    <!-- Step 0: choose what to import -->
                    <div v-if="state.step === 'type'">
                        <p class="text-sm text-slate-600">{{ $t('import.modal.question') }}</p>
                        <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button v-for="ent in entityTypes" :key="ent.key" type="button" @click="selectType(ent.key)"
                                class="flex items-center gap-x-3 rounded-xl border px-4 py-3 text-left transition-colors"
                                :class="ent.available ? 'border-slate-200 hover:border-primary hover:bg-primary-25' : 'border-slate-100 opacity-50 cursor-not-allowed'">
                                <Icon :name="ent.icon" class="h-6 w-6 text-primary shrink-0" />
                                <div>
                                    <p class="text-sm font-medium text-slate-800">{{ ent.label }}</p>
                                    <p class="text-xs text-slate-400">
                                        {{
                                            ent.available ? 'CSV' :
                                                $t('import.steps.type.comingSoon')
                                        }}
                                    </p>
                                </div>
                            </button>
                        </div>
                    </div>

                    <!-- Step 1: upload -->
                    <div v-else-if="state.step === 'upload'">
                        <p class="text-sm text-slate-600">
                            {{ $t('import.steps.upload.instruction', { entity: entity.label.toLowerCase() }) }}
                        </p>
                        <div class="mt-4 rounded-xl border-2 border-dashed transition-colors p-8 text-center cursor-pointer"
                            :class="state.dragOver ? 'border-primary bg-primary-25' : 'border-slate-200 hover:border-primary'"
                            @click="fileInput?.click()" @dragover.prevent="state.dragOver = true"
                            @dragenter.prevent="state.dragOver = true" @dragleave.prevent="state.dragOver = false"
                            @drop.prevent="handleDrop">
                            <Icon name="ph:file-csv" class="mx-auto h-10 w-10 text-slate-300" />
                            <p class="mt-2 text-sm text-slate-600">{{ $t('import.steps.upload.dropzone') }}</p>
                            <p v-if="state.fileName" class="mt-2 text-sm font-medium text-primary">{{ state.fileName }}
                            </p>
                            <input ref="fileInput" type="file"
                                accept=".csv,text/csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                class="hidden" @change="handleFile" />
                        </div>
                    </div>

                    <!-- Step 2: map columns -->
                    <div v-else-if="state.step === 'map'">
                        <p class="text-sm text-slate-600">
                            {{
                                $t('import.steps.map.columnsFound', {
                                    headers: state.headers.length, rows:
                                        state.rows.length
                                })
                            }}
                        </p>
                        <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <!-- Your columns (draggable) -->
                            <div>
                                <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{{
                                    $t('import.steps.map.yourColumns') }}</p>
                                <div class="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                                    <div v-for="(h, i) in state.headers" :key="i" draggable="true"
                                        @dragstart="dragIndex = i" @dragend="dragIndex = -1"
                                        class="flex items-center gap-x-2 rounded-lg border px-3 py-2 cursor-grab active:cursor-grabbing transition-colors"
                                        :class="isHeaderUsed(i) ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white hover:border-primary'">
                                        <Icon name="ph:dots-six-vertical" class="h-4 w-4 text-slate-300 shrink-0" />
                                        <div class="min-w-0">
                                            <p class="text-sm text-slate-800 truncate">
                                                {{ h || $t('import.steps.map.noName') }}
                                            </p>
                                            <p class="text-[11px] text-slate-400 truncate">
                                                {{ sampleFor(i) }}
                                            </p>
                                        </div>
                                        <Icon v-if="isHeaderUsed(i)" name="ph:check-circle-fill"
                                            class="ml-auto h-4 w-4 text-emerald-500 shrink-0" />
                                    </div>
                                </div>
                            </div>
                            <!-- CitizenOne fields (drop zones) -->
                            <div>
                                <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{{
                                    $t('import.steps.map.citizenOneFields') }}</p>
                                <div class="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                                    <div v-for="field in targetFields" :key="field.key" @dragover.prevent
                                        @drop="dropOnField(field.key)"
                                        class="rounded-lg border px-3 py-2 transition-colors"
                                        :class="[(state.mapping[field.key] ?? -1) >= 0 ? 'border-primary/40 bg-primary-25' : 'border-dashed border-slate-300', dragIndex >= 0 ? 'ring-1 ring-primary/30' : '']">
                                        <div class="flex items-center justify-between gap-x-2">
                                            <span class="text-sm text-slate-700">{{ field.label }}<span
                                                    v-if="field.required" class="text-red-500"> *</span></span>
                                            <span v-if="(state.mapping[field.key] ?? -1) >= 0"
                                                class="flex items-center gap-x-1 text-xs text-primary font-medium max-w-[55%] truncate">
                                                <span class="truncate">
                                                    {{
                                                        state.headers[state.mapping[field.key]] ||
                                                        $t('import.steps.map.noColumnName')
                                                    }}
                                                </span>
                                                <button type="button" @click="state.mapping[field.key] = -1"
                                                    class="hover:text-red-500 shrink-0">
                                                    <Icon name="ph:x" class="h-3.5 w-3.5" />
                                                </button>
                                            </span>
                                            <span v-else class="text-xs text-slate-400">{{
                                                $t('import.steps.map.dragColumnHere') }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Live preview -->
                        <div v-if="mappedFields.length" class="mt-4">
                            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                                {{ $t('import.steps.map.preview') }}
                            </p>
                            <div class="overflow-x-auto rounded-lg border border-slate-100">
                                <table class="min-w-full text-xs">
                                    <thead class="bg-slate-50">
                                        <tr>
                                            <th v-for="field in mappedFields" :key="field.key"
                                                class="px-2 py-1.5 text-left font-medium text-slate-500 whitespace-nowrap">
                                                {{ field.label }}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-slate-100">
                                        <tr v-for="(row, ri) in previewRows" :key="ri">
                                            <td v-for="field in mappedFields" :key="field.key"
                                                class="px-2 py-1.5 text-slate-700 max-w-[16rem] truncate">
                                                {{ cell(row, field.key) }}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <p v-if="!requiredMapped" class="mt-3 text-xs text-amber-600">
                            {{ $t('import.steps.map.requiredFieldsHint') }}
                        </p>
                    </div>

                    <!-- Step 3: dry-run preview (nothing is saved yet) -->
                    <div v-else-if="state.step === 'preview'">
                        <p class="text-sm text-slate-600">
                            {{ $t('import.steps.dryRun.title') }}
                        </p>
                        <div class="mt-4 grid grid-cols-2 gap-3">
                            <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                                <p class="text-2xl font-semibold text-emerald-700">
                                    {{ state.preview?.validCount ?? 0 }}
                                </p>
                                <p class="text-xs text-emerald-700">
                                    {{ $t('import.steps.dryRun.readyToImport') }}
                                </p>
                            </div>
                            <div class="rounded-xl border p-4 text-center"
                                :class="state.preview?.skipCount ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50'">
                                <p class="text-2xl font-semibold"
                                    :class="state.preview?.skipCount ? 'text-amber-700' : 'text-slate-400'">{{
                                        state.preview?.skipCount ?? 0 }}</p>
                                <p class="text-xs"
                                    :class="state.preview?.skipCount ? 'text-amber-700' : 'text-slate-400'">{{
                                        $t('import.steps.dryRun.skipped') }}</p>
                            </div>
                        </div>
                        <div v-if="state.preview?.skipCount" class="mt-4 text-left">
                            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{{
                                $t('import.steps.dryRun.whySkipped') }}</p>
                            <ul class="text-sm text-slate-600 space-y-1">
                                <li v-for="(count, reason) in state.preview.reasons" :key="reason"
                                    class="flex justify-between gap-x-3 rounded-lg bg-slate-50 px-3 py-1.5">
                                    <span>{{ reason }}</span><span class="text-slate-400">{{ count }}</span>
                                </li>
                            </ul>
                        </div>
                        <p v-if="state.entityKey === 'journals'" class="mt-4 text-xs text-slate-400">
                            {{ $t('import.steps.dryRun.journalHint') }}
                        </p>
                        <p v-else-if="state.entityKey === 'schedules'" class="mt-4 text-xs text-slate-400">
                            {{ $t('import.steps.dryRun.scheduleHint') }}
                        </p>
                        <p v-else-if="state.entityKey === 'citizens'" class="mt-4 text-xs text-slate-400">
                            {{ $t('import.steps.dryRun.citizensHint') }}
                        </p>
                        <p v-else-if="state.entityKey === 'employees'" class="mt-4 text-xs text-slate-400">
                            {{ $t('import.steps.dryRun.employeesHint') }}
                        </p>
                        <p v-if="!state.preview?.validCount" class="mt-3 text-sm text-amber-600">
                            {{ $t('import.steps.dryRun.noValidRows') }}
                        </p>
                    </div>

                    <!-- Importing (batched) -->
                    <div v-else-if="state.step === 'importing'" class="py-10 text-center">
                        <p class="text-sm text-slate-600">{{ $t('import.steps.importing.label') }}</p>
                        <div class="mt-3 mx-auto w-64 h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div class="h-full bg-primary transition-all duration-300"
                                :style="{ width: progressPct + '%' }" />
                        </div>
                        <p class="mt-2 text-xs text-slate-400">
                            {{ state.progress.done }} / {{ state.progress.total }}
                        </p>
                    </div>

                    <!-- Step 4: done / summary -->
                    <div v-else-if="state.step === 'done'" class="text-center py-2">
                        <Icon name="ph:check-circle-fill" class="mx-auto h-12 w-12 text-emerald-500" />
                        <p class="mt-2 text-lg font-semibold text-slate-900">
                            {{ $t('import.steps.done.imported', {
                                count: state.summary?.created ?? 0
                            }) }}
                        </p>
                        <p v-if="summaryUnmatched > 0" class="mt-1 text-sm text-amber-600">
                            {{ $t('import.steps.done.rowsSkipped', { count: summaryUnmatched }) }}
                        </p>
                        <p v-else class="mt-1 text-sm text-slate-500">
                            {{ $t('import.steps.done.allImported') }}
                        </p>
                        <p v-if="(state.summary?.duplicate_count ?? 0) > 0" class="mt-1 text-sm text-slate-500">
                            {{ $t('import.steps.done.alreadyExisted', { count: state.summary.duplicate_count }) }}
                        </p>
                        <div v-if="(state.summary?.license_blocked_count ?? 0) > 0"
                            class="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-left">
                            <p class="text-sm font-medium text-amber-800">
                                {{ $t('import.steps.done.licenseBlocked', {
                                    count: state.summary.license_blocked_count
                                }) }}
                            </p>
                            <p class="mt-1 text-xs text-amber-700">
                                {{ $t('import.steps.done.licenseHint', { count: state.summary.license_blocked_count })
                                }}
                            </p>
                            <NuxtLink to="/settings/license-overview" @click="closeModal"
                                class="mt-2 inline-flex items-center gap-x-1.5 text-sm font-medium text-primary hover:text-primary-700">
                                <Icon name="ph:plus-circle" class="h-4 w-4" /> {{ $t('import.steps.done.addLicenses') }}
                            </NuxtLink>
                        </div>
                        <div v-if="state.entityKey === 'employees' && (state.summary?.created ?? 0) > 0 && !state.summary?.undone"
                            class="mt-4">
                            <p v-if="state.summary?.invitesSent" class="text-sm text-emerald-600">{{
                                $t('import.steps.done.invitesSent') }}</p>
                            <template v-else>
                                <FormButton buttonStyle="primary" @click="sendInvites">
                                    {{ $t('import.steps.done.sendInvites', { count: state.summary.created }) }}
                                </FormButton>
                                <p class="mt-1 text-xs text-slate-400">
                                    {{ $t('import.steps.done.inviteHint') }}
                                </p>
                            </template>
                        </div>

                        <div v-if="entity.mode === 'json' && (state.summary?.created ?? 0) > 0" class="mt-4">
                            <p v-if="state.summary?.undone" class="text-sm text-slate-500">{{
                                $t('import.steps.done.undone') }}</p>
                            <button v-else type="button" @click="undoImport"
                                class="inline-flex items-center gap-x-1.5 text-sm font-medium text-red-600 hover:text-red-700">
                                <Icon name="ph:arrow-counter-clockwise" class="h-4 w-4" />
                                {{ $t('import.steps.done.undo', { count: state.summary.created }) }}
                            </button>
                        </div>
                        <div v-if="summaryUnmatched > 0"
                            class="mt-3 text-left text-xs text-slate-500 max-h-40 overflow-y-auto rounded-lg bg-slate-50 p-3">
                            <p v-if="state.summary?.unmatched?.length">
                                <strong>{{ $t('import.steps.done.unmatchedCpr') }}</strong>
                                {{ state.summary.unmatched.join(', ') }}
                            </p>
                            <p v-if="state.summary?.unmatched_employee?.length">
                                <strong>{{ $t('import.steps.done.unmatchedEmails') }}</strong>
                                {{ state.summary.unmatched_employee.join(', ') }}
                            </p>
                            <p v-if="state.summary?.unmatched_shift?.length">
                                <strong>{{ $t('import.steps.done.unknownShifts') }}</strong>
                                {{ state.summary.unmatched_shift.join(', ') }}
                            </p>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="mt-6 flex justify-between gap-x-3" v-if="state.step !== 'importing'">
                        <FormButton buttonStyle="cancel" @click="back">
                            {{
                                state.step === 'type' ? $t('cancel') : (state.step === 'done' ? $t('import.footer.close')
                                    :
                                    $t('import.footer.back'))
                            }}
                        </FormButton>
                        <FormButton v-if="state.step === 'map'" buttonStyle="primary" :disabled="!requiredMapped"
                            @click="goToPreview">
                            {{ $t('import.footer.review', { count: state.rows.length }) }}
                        </FormButton>
                        <FormButton v-else-if="state.step === 'preview'" buttonStyle="primary"
                            :disabled="!state.preview?.validCount" @click="runImport">
                            {{ $t('import.footer.import', {
                                count: state.preview?.validCount ?? 0, entity:
                                    entity.label.toLowerCase()
                            }) }}
                        </FormButton>
                    </div>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { citizenService } from '@/components/api/user/CitizenService'
import { userService } from '@/components/api/user/UserService'
import { journalService } from '@/components/api/user/JournalService'
import { dutyScheduleService } from '@/components/api/user/DutyScheduleService'
import { importService } from '@/components/api/user/ImportService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'

const props = defineProps({
    isModalOpen: { type: Boolean, required: true },
})
const emit = defineEmits(['close', 'imported'])
const { successAlert } = useAlert()
const { t } = useI18n()

const fileInput = ref<HTMLInputElement | null>(null)

const entityTypes = computed(() => [
    {
        key: 'citizens', label: t('import.entities.citizens'), icon: 'ph:users-three', available: true, mode: 'json',
        importFn: (payload: object) => citizenService.importMappedCitizens(payload),
        fields: [
            { key: 'firstname', label: t('import.fields.firstname'), required: true },
            { key: 'lastname', label: t('import.fields.lastname'), required: true },
            { key: 'cpr_number', label: t('import.fields.cpr_number'), required: false },
            { key: 'birthday', label: t('import.fields.birthday'), required: false },
            { key: 'gender', label: t('import.fields.gender'), required: false },
            { key: 'email', label: t('import.fields.email'), required: false },
            { key: 'phone', label: t('import.fields.phone'), required: false },
            { key: 'date_admitted', label: t('import.fields.date_admitted'), required: false },
            { key: 'date_discharged', label: t('import.fields.date_discharged'), required: false },
            { key: 'departments', label: t('import.fields.departments'), required: false },
        ],
    },
    {
        key: 'employees', label: t('import.entities.employees'), icon: 'ph:identification-badge', available: true, mode: 'json',
        importFn: (payload: object) => userService.importMappedEmployees(payload),
        fields: [
            { key: 'firstname', label: t('import.fields.firstname'), required: true },
            { key: 'lastname', label: t('import.fields.lastname'), required: true },
            { key: 'email', label: t('import.fields.email'), required: false },
            { key: 'phone', label: t('import.fields.phone'), required: false },
            { key: 'birthday', label: t('import.fields.birthday'), required: false },
            { key: 'seniority_date', label: t('import.fields.seniority_date'), required: false },
            { key: 'departments', label: t('import.fields.departments'), required: false },
        ],
    },
    {
        key: 'journals', label: t('import.entities.journals'), icon: 'ph:note-pencil', available: true, mode: 'json',
        importFn: (payload: object) => journalService.importMappedJournals(payload),
        fields: [
            { key: 'cpr', label: t('import.fields.cpr'), required: true },
            { key: 'date', label: t('import.fields.date'), required: false },
            { key: 'title', label: t('import.fields.title'), required: false },
            { key: 'content', label: t('import.fields.content'), required: false },
        ],
    },
    {
        key: 'schedules', label: t('import.entities.schedules'), icon: 'ph:calendar-dots', available: true, mode: 'json',
        importFn: (payload: object) => dutyScheduleService.importMappedSchedules(payload),
        fields: [
            { key: 'email', label: t('import.fields.email_employee'), required: true },
            { key: 'shift', label: t('import.fields.shift'), required: true },
            { key: 'date', label: t('import.fields.date'), required: true },
            { key: 'start_time', label: t('import.fields.start_time'), required: false },
            { key: 'end_time', label: t('import.fields.end_time'), required: false },
        ],
    },
])

const synonyms: Record<string, string[]> = {
    firstname: ['fornavn', 'firstname', 'first name', 'givenname', 'navn', 'name'],
    lastname: ['efternavn', 'lastname', 'last name', 'surname', 'familienavn'],
    cpr_number: ['cpr', 'cprnr', 'cpr-nr', 'cprnummer', 'personnummer', 'ssn', 'social'],
    birthday: ['fødselsdato', 'fodselsdato', 'birthday', 'birthdate', 'dob', 'født', 'fodt'],
    gender: ['køn', 'kon', 'gender', 'sex'],
    email: ['email', 'e-mail', 'mail'],
    phone: ['telefon', 'tlf', 'phone', 'mobil', 'mobile'],
    date_admitted: ['indskrivning', 'indskrevet', 'admitted', 'startdato', 'opstart', 'start'],
    date_discharged: ['udskrivning', 'udskrevet', 'discharged', 'slutdato', 'ophør', 'ophor', 'slut'],
    departments: ['afdeling', 'afdelinger', 'department', 'departments', 'team', 'enhed', 'gruppe'],
    seniority_date: ['anciennitet', 'ancien', 'seniority', 'ansættelsesdato', 'ansaettelsesdato', 'ansat', 'startdato'],
    cpr: ['cpr', 'cprnr', 'cpr-nr', 'cprnummer', 'personnummer', 'ssn', 'borger'],
    shift: ['vagt', 'vagttype', 'shift', 'skift', 'vagtnavn', 'type'],
    date: ['dato', 'date', 'dag', 'journaldato', 'vagtdato'],
    title: ['titel', 'overskrift', 'title', 'emne', 'header'],
    content: ['notat', 'tekst', 'indhold', 'content', 'note', 'beskrivelse', 'journal', 'body'],
    start_time: ['start', 'starttid', 'fra', 'mødetid', 'modetid', 'indtid', 'starttime'],
    end_time: ['slut', 'sluttid', 'til', 'udtid', 'endtime', 'sluttime'],
}

const state = reactive({
    step: 'type' as 'type' | 'upload' | 'map' | 'preview' | 'importing' | 'done',
    entityKey: 'citizens',
    progress: { done: 0, total: 0 },
    fileName: '',
    headers: [] as string[],
    rows: [] as string[][],
    mapping: {} as Record<string, number>,
    preview: null as any,
    summary: null as any,
    dragOver: false,
    error: '',
    isLoading: false,
})

const summaryUnmatched = computed(() => (state.summary?.unmatched_count ?? 0)
    + (state.summary?.unmatched_employee_count ?? 0) + (state.summary?.unmatched_shift_count ?? 0))
const progressPct = computed(() => state.progress.total ? Math.round(state.progress.done / state.progress.total * 100) : 0)

const entity = computed(() => entityTypes.value.find(e => e.key === state.entityKey) ?? entityTypes.value[0])
const targetFields = computed(() => entity.value.fields as { key: string; label: string; required: boolean }[])
const requiredMapped = computed(() =>
    targetFields.value.filter(f => f.required).every(f => (state.mapping[f.key] ?? -1) >= 0))
const mappedFields = computed(() => targetFields.value.filter(f => (state.mapping[f.key] ?? -1) >= 0))
const previewRows = computed(() => state.rows.slice(0, 5))

function selectType(key: string) {
    const ent = entityTypes.value.find(e => e.key === key)
    if (!ent?.available) return
    state.entityKey = key
    state.step = 'upload'
}

function cell(row: string[], key: string) {
    const idx = state.mapping[key] ?? -1
    return idx < 0 ? '' : (row[idx] ?? '')
}

// --- drag & drop mapping ---
const dragIndex = ref(-1)

function isHeaderUsed(i: number) {
    return Object.values(state.mapping).includes(i)
}

function sampleFor(i: number) {
    const r = state.rows.find(row => ((row[i] ?? '').toString().trim() !== ''))
    return r ? (r[i] ?? '').toString().slice(0, 40) : ''
}

function dropOnField(key: string) {
    if (dragIndex.value >= 0) state.mapping[key] = dragIndex.value
    dragIndex.value = -1
}

function detectDelimiter(line: string) {
    return (line.split(';').length > line.split(',').length) ? ';' : ','
}

// Minimal RFC-4180-ish CSV parser (handles quoted fields, embedded delimiters/newlines)
function parseCsv(text: string, delimiter: string): string[][] {
    const rows: string[][] = []
    let field = '', row: string[] = [], inQuotes = false
    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    for (let i = 0; i < text.length; i++) {
        const c = text[i]
        if (inQuotes) {
            if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++ } else inQuotes = false }
            else field += c
        } else if (c === '"') inQuotes = true
        else if (c === delimiter) { row.push(field); field = '' }
        else if (c === '\n') { row.push(field); rows.push(row); field = ''; row = [] }
        else field += c
    }
    if (field.length || row.length) { row.push(field); rows.push(row) }
    return rows.filter(r => r.some(c => c.trim() !== ''))
}

function autoGuess() {
    state.mapping = {}
    state.headers.forEach((h, i) => {
        const norm = h.toLowerCase().replace(/[\s_\-.]/g, '')
        for (const field of targetFields.value) {
            if ((state.mapping[field.key] ?? -1) >= 0) continue
            if ((synonyms[field.key] ?? []).some(s => norm.includes(s.replace(/[\s_\-.]/g, '')))) {
                state.mapping[field.key] = i
                break
            }
        }
    })
    targetFields.value.forEach(f => { if (state.mapping[f.key] === undefined) state.mapping[f.key] = -1 })
}

function applyRows(all: string[][]) {
    if (all.length < 2) { state.error = t('import.errors.emptyFile'); return }
    state.headers = all[0].map(h => (h ?? '').toString().trim())
    state.rows = all.slice(1)
    autoGuess()
    state.step = 'map'
}

function handleFile(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) processFile(file)
}

function handleDrop(e: DragEvent) {
    state.dragOver = false
    const file = e.dataTransfer?.files?.[0]
    if (file) processFile(file)
}

async function processFile(file: File) {
    if (!file) return
    state.error = ''
    state.fileName = file.name
    const isExcel = /\.(xlsx|xls)$/i.test(file.name)
    try {
        if (isExcel) {
            const XLSX = await import('xlsx')
            const buffer = await file.arrayBuffer()
            const wb = XLSX.read(new Uint8Array(buffer), { type: 'array' })
            const sheet = wb.Sheets[wb.SheetNames[0]]
            const all = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' }) as string[][]
            applyRows(all.filter(r => Array.isArray(r) && r.some(c => (c ?? '').toString().trim() !== '')))
        } else {
            const text = await file.text()
            const firstLine = text.split(/\r?\n/)[0] ?? ''
            applyRows(parseCsv(text, detectDelimiter(firstLine)))
        }
    } catch (err) {
        state.error = t('import.errors.readError')
    }
}

function buildCsv(rows: string[][]): string {
    const esc = (v: string) => /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v
    const heading = targetFields.value.map(f => f.key).join(',')
    const lines = rows.map(row =>
        targetFields.value.map(f => {
            const idx = state.mapping[f.key] ?? -1
            return esc(idx < 0 ? '' : (row[idx] ?? '').trim())
        }).join(','))
    return [heading, ...lines].join('\n')
}

function mapRowToObj(row: string[]): Record<string, string> {
    const obj: Record<string, string> = {}
    targetFields.value.forEach(f => {
        const idx = state.mapping[f.key] ?? -1
        obj[f.key] = idx < 0 ? '' : (row[idx] ?? '').trim()
    })
    return obj
}

// Per-field format expectations for the dry-run validation.
const FIELD_FORMAT: Record<string, 'cpr' | 'email' | 'date' | 'time'> = {
    cpr_number: 'cpr', cpr: 'cpr', email: 'email',
    birthday: 'date', date: 'date', date_admitted: 'date', date_discharged: 'date', seniority_date: 'date',
    start_time: 'time', end_time: 'time',
}
function formatOk(kind: string, v: string): boolean {
    if (kind === 'cpr') return v.replace(/\D/g, '').length === 10
    if (kind === 'email') return /.+@.+\..+/.test(v)
    if (kind === 'date') return /^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}$/.test(v) || /^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}$/.test(v)
    if (kind === 'time') return /^\d{1,2}:\d{2}$/.test(v)
    return true
}
function cleanLabel(label: string) { return label.replace(/\s*\(.*\)/, '').trim() }

// Returns null if the row is valid, else a human reason it will be skipped.
function rowSkipReason(obj: Record<string, string>): string | null {
    for (const f of targetFields.value) {
        const v = (obj[f.key] ?? '').trim()
        if (f.required && !v) return t('import.errors.missingField', { field: cleanLabel(f.label) })
        if (v && FIELD_FORMAT[f.key] && !formatOk(FIELD_FORMAT[f.key], v)) return t('import.errors.invalidField', { field: cleanLabel(f.label) })
    }
    return null
}

// Dry run: classify every row, keep only the valid ones for the actual import.
function goToPreview() {
    const valid: string[][] = []
    const reasons: Record<string, number> = {}
    for (const row of state.rows) {
        const reason = rowSkipReason(mapRowToObj(row))
        if (reason) reasons[reason] = (reasons[reason] ?? 0) + 1
        else valid.push(row)
    }
    state.preview = {
        total: state.rows.length,
        valid,
        validCount: valid.length,
        skipCount: state.rows.length - valid.length,
        reasons,
    }
    state.step = 'preview'
}

async function runImport() {
    state.isLoading = true
    state.error = ''
    const rowsToImport: string[][] = state.preview?.valid ?? state.rows
    try {
        if (entity.value.mode === 'json') {
            const allRows = rowsToImport.map(row => mapRowToObj(row))
            const CHUNK = 300
            const batchRef = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${state.entityKey}`)
            const acc: any = { created: 0, duplicate_count: 0, unmatched_count: 0, unmatched_employee_count: 0, unmatched_shift_count: 0, unmatched: [], unmatched_employee: [], unmatched_shift: [], batch_ref: batchRef, undone: false }
            const pushCapped = (arr: string[], add: any) => { if (Array.isArray(add)) for (const v of add) if (arr.length < 100) arr.push(v) }

            state.progress = { done: 0, total: allRows.length }
            state.step = 'importing'

            for (let i = 0; i < allRows.length; i += CHUNK) {
                const chunk = allRows.slice(i, i + CHUNK)
                const res: any = await entity.value.importFn({ rows: chunk, batch_ref: batchRef })
                acc.created += res?.created ?? 0
                acc.duplicate_count += res?.duplicate_count ?? 0
                acc.unmatched_count += res?.unmatched_count ?? 0
                acc.unmatched_employee_count += res?.unmatched_employee_count ?? 0
                acc.unmatched_shift_count += res?.unmatched_shift_count ?? 0
                pushCapped(acc.unmatched, res?.unmatched)
                pushCapped(acc.unmatched_employee, res?.unmatched_employee)
                pushCapped(acc.unmatched_shift, res?.unmatched_shift)
                state.progress.done = Math.min(i + CHUNK, allRows.length)
            }
            state.summary = acc
            emit('imported', state.entityKey)
            state.step = 'done'
        } else {
            const csv = buildCsv(rowsToImport)
            const file = new File([csv], 'citizenone-import.csv', { type: 'text/csv' })
            const params = new FormData()
            params.append('file', file)
            const response = await entity.value.importFn(params)
            if (response) {
                successAlert(`${t('alert.success')}!`, response?.message || t('import.steps.done.imported', { count: '' }))
                emit('imported', state.entityKey)
                closeModal()
            }
        }
    } catch (error: any) {
        state.error = error?.message || t('import.errors.importFailed')
    }
    state.isLoading = false
}

async function undoImport() {
    if (!state.summary?.batch_ref || state.summary.undone) return
    state.isLoading = true
    try {
        const res: any = await importService.undoImport({ batch_ref: state.summary.batch_ref })
        state.summary.undone = true
        successAlert(`${t('alert.success')}!`, `${res?.deleted ?? 0} ${t('import.steps.done.rowsSkipped', { count: res?.deleted ?? 0 })}`)
        emit('imported', state.entityKey)
    } catch (error: any) {
        state.error = error?.message || t('import.errors.undoFailed')
    }
    state.isLoading = false
}

async function sendInvites() {
    if (!state.summary?.batch_ref || state.summary.invitesSent || state.summary.undone) return
    state.isLoading = true
    try {
        const res: any = await importService.sendInvites({ batch_ref: state.summary.batch_ref })
        state.summary.invitesSent = true
        successAlert(`${t('alert.success')}!`, t('import.steps.done.invitesSent'))
    } catch (error: any) {
        state.error = error?.message || t('import.errors.invitesFailed')
    }
    state.isLoading = false
}

function back() {
    if (state.step === 'preview') state.step = 'map'
    else if (state.step === 'map') { resetFile(); state.step = 'upload' }
    else if (state.step === 'upload') { resetFile(); state.step = 'type' }
    else closeModal()
}

function resetFile() {
    state.fileName = ''; state.headers = []; state.rows = []; state.mapping = {}; state.error = ''; state.preview = null
}

function closeModal() {
    resetFile(); state.step = 'type'; state.entityKey = 'citizens'; state.summary = null
    state.progress = { done: 0, total: 0 }
    emit('close')
}
</script>
