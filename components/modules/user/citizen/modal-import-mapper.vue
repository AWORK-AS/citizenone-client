<template>
    <div>
        <Modal size="lg" :title="'Importér fra andet system'" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <Alert type="danger" :text="state.error" v-if="state.error" />
                <LoadingSpinner :isActive="state.isLoading">

                    <!-- Step 0: choose what to import -->
                    <div v-if="state.step === 'type'">
                        <p class="text-sm text-slate-600">Hvad vil du importere fra dit gamle system?</p>
                        <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button v-for="ent in entityTypes" :key="ent.key" type="button"
                                @click="selectType(ent.key)"
                                class="flex items-center gap-x-3 rounded-xl border px-4 py-3 text-left transition-colors"
                                :class="ent.available ? 'border-slate-200 hover:border-primary hover:bg-primary-25' : 'border-slate-100 opacity-50 cursor-not-allowed'">
                                <Icon :name="ent.icon" class="h-6 w-6 text-primary shrink-0" />
                                <div>
                                    <p class="text-sm font-medium text-slate-800">{{ ent.label }}</p>
                                    <p class="text-xs text-slate-400">{{ ent.available ? 'CSV' : 'Kommer snart' }}</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    <!-- Step 1: upload -->
                    <div v-else-if="state.step === 'upload'">
                        <p class="text-sm text-slate-600">
                            Upload en fil med dine <strong>{{ entity.label.toLowerCase() }}</strong>
                            (CSV eller Excel). Vi kobler kolonnerne til CitizenOne i næste trin.
                        </p>
                        <div class="mt-4 rounded-xl border-2 border-dashed transition-colors p-8 text-center cursor-pointer"
                            :class="state.dragOver ? 'border-primary bg-primary-25' : 'border-slate-200 hover:border-primary'"
                            @click="fileInput?.click()"
                            @dragover.prevent="state.dragOver = true"
                            @dragenter.prevent="state.dragOver = true"
                            @dragleave.prevent="state.dragOver = false"
                            @drop.prevent="handleDrop">
                            <Icon name="ph:file-csv" class="mx-auto h-10 w-10 text-slate-300" />
                            <p class="mt-2 text-sm text-slate-600">Træk en fil hertil, eller klik for at vælge en CSV- eller Excel-fil</p>
                            <p v-if="state.fileName" class="mt-2 text-sm font-medium text-primary">{{ state.fileName }}</p>
                            <input ref="fileInput" type="file" accept=".csv,text/csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" class="hidden" @change="handleFile" />
                        </div>
                    </div>

                    <!-- Step 2: map columns -->
                    <div v-else-if="state.step === 'map'">
                        <p class="text-sm text-slate-600">
                            Kobl dine kolonner ({{ state.headers.length }} fundet, {{ state.rows.length }} rækker) til CitizenOne-felterne.
                            Vi har gættet ud fra kolonnenavnene — ret hvor nødvendigt.
                        </p>
                        <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <!-- Your columns (draggable) -->
                            <div>
                                <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Dine kolonner — træk dem over</p>
                                <div class="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                                    <div v-for="(h, i) in state.headers" :key="i" draggable="true"
                                        @dragstart="dragIndex = i" @dragend="dragIndex = -1"
                                        class="flex items-center gap-x-2 rounded-lg border px-3 py-2 cursor-grab active:cursor-grabbing transition-colors"
                                        :class="isHeaderUsed(i) ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white hover:border-primary'">
                                        <Icon name="ph:dots-six-vertical" class="h-4 w-4 text-slate-300 shrink-0" />
                                        <div class="min-w-0">
                                            <p class="text-sm text-slate-800 truncate">{{ h || '(uden navn)' }}</p>
                                            <p class="text-[11px] text-slate-400 truncate">{{ sampleFor(i) }}</p>
                                        </div>
                                        <Icon v-if="isHeaderUsed(i)" name="ph:check-circle-fill" class="ml-auto h-4 w-4 text-emerald-500 shrink-0" />
                                    </div>
                                </div>
                            </div>
                            <!-- CitizenOne fields (drop zones) -->
                            <div>
                                <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">CitizenOne-felter</p>
                                <div class="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                                    <div v-for="field in targetFields" :key="field.key"
                                        @dragover.prevent @drop="dropOnField(field.key)"
                                        class="rounded-lg border px-3 py-2 transition-colors"
                                        :class="[(state.mapping[field.key] ?? -1) >= 0 ? 'border-primary/40 bg-primary-25' : 'border-dashed border-slate-300', dragIndex >= 0 ? 'ring-1 ring-primary/30' : '']">
                                        <div class="flex items-center justify-between gap-x-2">
                                            <span class="text-sm text-slate-700">{{ field.label }}<span v-if="field.required" class="text-red-500"> *</span></span>
                                            <span v-if="(state.mapping[field.key] ?? -1) >= 0" class="flex items-center gap-x-1 text-xs text-primary font-medium max-w-[55%] truncate">
                                                <span class="truncate">{{ state.headers[state.mapping[field.key]] || '(kolonne)' }}</span>
                                                <button type="button" @click="state.mapping[field.key] = -1" class="hover:text-red-500 shrink-0"><Icon name="ph:x" class="h-3.5 w-3.5" /></button>
                                            </span>
                                            <span v-else class="text-xs text-slate-400">Træk en kolonne hertil</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Live preview -->
                        <div v-if="mappedFields.length" class="mt-4">
                            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Forhåndsvisning</p>
                            <div class="overflow-x-auto rounded-lg border border-slate-100">
                                <table class="min-w-full text-xs">
                                    <thead class="bg-slate-50">
                                        <tr>
                                            <th v-for="field in mappedFields" :key="field.key" class="px-2 py-1.5 text-left font-medium text-slate-500 whitespace-nowrap">{{ field.label }}</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-slate-100">
                                        <tr v-for="(row, ri) in previewRows" :key="ri">
                                            <td v-for="field in mappedFields" :key="field.key" class="px-2 py-1.5 text-slate-700 max-w-[16rem] truncate">{{ cell(row, field.key) }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <p v-if="!requiredMapped" class="mt-3 text-xs text-amber-600">
                            De obligatoriske felter (*) skal kobles for at kunne importere.
                        </p>
                    </div>

                    <!-- Step 3: dry-run preview (nothing is saved yet) -->
                    <div v-else-if="state.step === 'preview'">
                        <p class="text-sm text-slate-600">Gennemgang før import — <strong>intet er gemt endnu.</strong></p>
                        <div class="mt-4 grid grid-cols-2 gap-3">
                            <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                                <p class="text-2xl font-semibold text-emerald-700">{{ state.preview?.validCount ?? 0 }}</p>
                                <p class="text-xs text-emerald-700">klar til import</p>
                            </div>
                            <div class="rounded-xl border p-4 text-center"
                                :class="state.preview?.skipCount ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-slate-50'">
                                <p class="text-2xl font-semibold" :class="state.preview?.skipCount ? 'text-amber-700' : 'text-slate-400'">{{ state.preview?.skipCount ?? 0 }}</p>
                                <p class="text-xs" :class="state.preview?.skipCount ? 'text-amber-700' : 'text-slate-400'">springes over</p>
                            </div>
                        </div>
                        <div v-if="state.preview?.skipCount" class="mt-4 text-left">
                            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Hvorfor springes rækker over</p>
                            <ul class="text-sm text-slate-600 space-y-1">
                                <li v-for="(count, reason) in state.preview.reasons" :key="reason"
                                    class="flex justify-between gap-x-3 rounded-lg bg-slate-50 px-3 py-1.5">
                                    <span>{{ reason }}</span><span class="text-slate-400">{{ count }}</span>
                                </li>
                            </ul>
                        </div>
                        <p v-if="state.entityKey === 'journals' || state.entityKey === 'schedules'" class="mt-4 text-xs text-slate-400">
                            Rækker uden match i CitizenOne ({{ state.entityKey === 'journals' ? 'ukendt CPR' : 'ukendt e-mail eller vagttype' }})
                            frasorteres automatisk under importen og vises i opsummeringen.
                        </p>
                        <p v-else-if="state.entityKey === 'citizens'" class="mt-4 text-xs text-slate-400">
                            Borgere der allerede findes (samme CPR eller navn) springes over.
                        </p>
                        <p v-else-if="state.entityKey === 'employees'" class="mt-4 text-xs text-slate-400">
                            Ansatte der allerede findes (samme e-mail eller navn) springes over. Hver ny ansat bruger én bruger-licens — løber I tør, oprettes resten ikke.
                        </p>
                        <p v-if="!state.preview?.validCount" class="mt-3 text-sm text-amber-600">
                            Ingen gyldige rækker at importere. Gå tilbage og tjek mapping og data.
                        </p>
                    </div>

                    <!-- Importing (batched) -->
                    <div v-else-if="state.step === 'importing'" class="py-10 text-center">
                        <p class="text-sm text-slate-600">Importerer…</p>
                        <div class="mt-3 mx-auto w-64 h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div class="h-full bg-primary transition-all duration-300" :style="{ width: progressPct + '%' }" />
                        </div>
                        <p class="mt-2 text-xs text-slate-400">{{ state.progress.done }} / {{ state.progress.total }}</p>
                    </div>

                    <!-- Step 4: done / summary -->
                    <div v-else-if="state.step === 'done'" class="text-center py-2">
                        <Icon name="ph:check-circle-fill" class="mx-auto h-12 w-12 text-emerald-500" />
                        <p class="mt-2 text-lg font-semibold text-slate-900">{{ state.summary?.created ?? 0 }} importeret</p>
                        <p v-if="summaryUnmatched > 0" class="mt-1 text-sm text-amber-600">
                            {{ summaryUnmatched }} række(r) kunne ikke matches og blev sprunget over.
                        </p>
                        <p v-else class="mt-1 text-sm text-slate-500">Alle rækker blev importeret.</p>
                        <p v-if="(state.summary?.duplicate_count ?? 0) > 0" class="mt-1 text-sm text-slate-500">
                            {{ state.summary.duplicate_count }} fandtes allerede og blev sprunget over.
                        </p>
                        <div v-if="(state.summary?.license_blocked_count ?? 0) > 0" class="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-left">
                            <p class="text-sm font-medium text-amber-800">
                                {{ state.summary.license_blocked_count }} ansatte kunne ikke oprettes — I mangler bruger-licenser.
                            </p>
                            <p class="mt-1 text-xs text-amber-700">
                                Tilføj mindst {{ state.summary.license_blocked_count }} licens(er) og kør importen igen — allerede oprettede springes over.
                            </p>
                            <NuxtLink to="/settings/license-overview" @click="closeModal"
                                class="mt-2 inline-flex items-center gap-x-1.5 text-sm font-medium text-primary hover:text-primary-700">
                                <Icon name="ph:plus-circle" class="h-4 w-4" /> Tilføj licenser
                            </NuxtLink>
                        </div>
                        <div v-if="state.entityKey === 'employees' && (state.summary?.created ?? 0) > 0 && !state.summary?.undone" class="mt-4">
                            <p v-if="state.summary?.invitesSent" class="text-sm text-emerald-600">Login-mails er sendt til de oprettede ansatte.</p>
                            <template v-else>
                                <FormButton buttonStyle="primary" @click="sendInvites">
                                    Send login-mails til {{ state.summary.created }} ansatte
                                </FormButton>
                                <p class="mt-1 text-xs text-slate-400">De oprettede ansatte får en e-mail med login og kom-i-gang-info. Importen sender ikke mails af sig selv.</p>
                            </template>
                        </div>

                        <div v-if="entity.mode === 'json' && (state.summary?.created ?? 0) > 0" class="mt-4">
                            <p v-if="state.summary?.undone" class="text-sm text-slate-500">Importen er fortrudt — rækkerne er slettet igen.</p>
                            <button v-else type="button" @click="undoImport"
                                class="inline-flex items-center gap-x-1.5 text-sm font-medium text-red-600 hover:text-red-700">
                                <Icon name="ph:arrow-counter-clockwise" class="h-4 w-4" />
                                Fortryd import ({{ state.summary.created }} oprettet)
                            </button>
                        </div>
                        <div v-if="summaryUnmatched > 0" class="mt-3 text-left text-xs text-slate-500 max-h-40 overflow-y-auto rounded-lg bg-slate-50 p-3">
                            <p v-if="state.summary?.unmatched?.length"><strong>Ikke-matchede CPR:</strong> {{ state.summary.unmatched.join(', ') }}</p>
                            <p v-if="state.summary?.unmatched_employee?.length"><strong>Ikke-matchede e-mails:</strong> {{ state.summary.unmatched_employee.join(', ') }}</p>
                            <p v-if="state.summary?.unmatched_shift?.length"><strong>Ukendte vagttyper:</strong> {{ state.summary.unmatched_shift.join(', ') }}</p>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="mt-6 flex justify-between gap-x-3" v-if="state.step !== 'importing'">
                        <FormButton buttonStyle="cancel" @click="back">
                            {{ state.step === 'type' ? $t('cancel') : (state.step === 'done' ? 'Luk' : 'Tilbage') }}
                        </FormButton>
                        <FormButton v-if="state.step === 'map'" buttonStyle="primary" :disabled="!requiredMapped" @click="goToPreview">
                            Gennemse {{ state.rows.length }} række(r)
                        </FormButton>
                        <FormButton v-else-if="state.step === 'preview'" buttonStyle="primary" :disabled="!state.preview?.validCount" @click="runImport">
                            Importér {{ state.preview?.validCount ?? 0 }} {{ entity.label.toLowerCase() }}
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

// Each entity reuses its existing import endpoint; fields match that import's template headings.
const entityTypes = [
    {
        key: 'citizens', label: 'Børn / borgere', icon: 'ph:users-three', available: true, mode: 'json',
        importFn: (payload: object) => citizenService.importMappedCitizens(payload),
        fields: [
            { key: 'firstname', label: 'Fornavn', required: true },
            { key: 'lastname', label: 'Efternavn', required: true },
            { key: 'cpr_number', label: 'CPR-nummer', required: false },
            { key: 'birthday', label: 'Fødselsdato (ÅÅÅÅ-MM-DD)', required: false },
            { key: 'gender', label: 'Køn (male/female)', required: false },
            { key: 'email', label: 'E-mail', required: false },
            { key: 'phone', label: 'Telefon', required: false },
            { key: 'date_admitted', label: 'Indskrivningsdato', required: false },
            { key: 'date_discharged', label: 'Udskrivningsdato', required: false },
            { key: 'departments', label: 'Afdelinger (adskilt med ;)', required: false },
        ],
    },
    {
        key: 'employees', label: 'Ansatte', icon: 'ph:identification-badge', available: true, mode: 'json',
        importFn: (payload: object) => userService.importMappedEmployees(payload),
        fields: [
            { key: 'firstname', label: 'Fornavn', required: true },
            { key: 'lastname', label: 'Efternavn', required: true },
            { key: 'email', label: 'E-mail', required: false },
            { key: 'phone', label: 'Telefon', required: false },
            { key: 'birthday', label: 'Fødselsdato (ÅÅÅÅ-MM-DD)', required: false },
            { key: 'seniority_date', label: 'Anciennitetsdato', required: false },
            { key: 'departments', label: 'Afdelinger (adskilt med ;)', required: false },
        ],
    },
    {
        key: 'journals', label: 'Journalnotater', icon: 'ph:note-pencil', available: true, mode: 'json',
        importFn: (payload: object) => journalService.importMappedJournals(payload),
        fields: [
            { key: 'cpr', label: 'Borgerens CPR-nummer (match)', required: true },
            { key: 'date', label: 'Dato (ÅÅÅÅ-MM-DD)', required: false },
            { key: 'title', label: 'Titel', required: false },
            { key: 'content', label: 'Notat-tekst', required: false },
        ],
    },
    {
        key: 'schedules', label: 'Vagtplaner', icon: 'ph:calendar-dots', available: true, mode: 'json',
        importFn: (payload: object) => dutyScheduleService.importMappedSchedules(payload),
        fields: [
            { key: 'email', label: 'Medarbejderens e-mail (match)', required: true },
            { key: 'shift', label: 'Vagttype (navn)', required: true },
            { key: 'date', label: 'Dato (ÅÅÅÅ-MM-DD)', required: true },
            { key: 'start_time', label: 'Starttid (TT:MM)', required: false },
            { key: 'end_time', label: 'Sluttid (TT:MM)', required: false },
        ],
    },
] as any[]

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

const entity = computed(() => entityTypes.find(e => e.key === state.entityKey) ?? entityTypes[0])
const targetFields = computed(() => entity.value.fields as { key: string; label: string; required: boolean }[])
const requiredMapped = computed(() =>
    targetFields.value.filter(f => f.required).every(f => (state.mapping[f.key] ?? -1) >= 0))
const mappedFields = computed(() => targetFields.value.filter(f => (state.mapping[f.key] ?? -1) >= 0))
const previewRows = computed(() => state.rows.slice(0, 5))

function selectType(key: string) {
    const ent = entityTypes.find(e => e.key === key)
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
    if (all.length < 2) { state.error = 'Filen ser tom ud eller har ingen datarækker.'; return }
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
        state.error = 'Kunne ikke læse filen. Tjek at det er en gyldig CSV- eller Excel-fil.'
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
        if (f.required && !v) return `Mangler ${cleanLabel(f.label)}`
        if (v && FIELD_FORMAT[f.key] && !formatOk(FIELD_FORMAT[f.key], v)) return `Ugyldig ${cleanLabel(f.label)}`
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
            // Relational entities (journals/schedules) post mapped rows as JSON;
            // the backend matches to citizen/employee and returns a summary.
            // Sent in batches so any file size stays within request limits + shows progress.
            const allRows = rowsToImport.map(row => mapRowToObj(row))
            const CHUNK = 300
            // One client-generated ref ties every chunk to a single undoable batch.
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
                successAlert(`${t('alert.success')}!`, response?.message || 'Importeret.')
                emit('imported', state.entityKey)
                closeModal()
            }
        }
    } catch (error: any) {
        state.error = error?.message || 'Importen fejlede. Tjek mapping og datoformater (ÅÅÅÅ-MM-DD).'
    }
    state.isLoading = false
}

async function undoImport() {
    if (!state.summary?.batch_ref || state.summary.undone) return
    state.isLoading = true
    try {
        const res: any = await importService.undoImport({ batch_ref: state.summary.batch_ref })
        state.summary.undone = true
        successAlert(`${t('alert.success')}!`, `${res?.deleted ?? 0} række(r) blev slettet igen.`)
        emit('imported', state.entityKey)
    } catch (error: any) {
        state.error = error?.message || 'Kunne ikke fortryde importen.'
    }
    state.isLoading = false
}

async function sendInvites() {
    if (!state.summary?.batch_ref || state.summary.invitesSent || state.summary.undone) return
    state.isLoading = true
    try {
        const res: any = await importService.sendInvites({ batch_ref: state.summary.batch_ref })
        state.summary.invitesSent = true
        successAlert(`${t('alert.success')}!`, `Login-mails sendt til ${res?.sent ?? 0} ansatte.`)
    } catch (error: any) {
        state.error = error?.message || 'Kunne ikke sende login-mails.'
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
