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
                            Eksportér <strong>{{ entity.label.toLowerCase() }}</strong> fra dit nuværende system som CSV
                            (fx "Gem som CSV" i Excel) og upload filen. Vi kobler kolonnerne til CitizenOne i næste trin.
                        </p>
                        <div class="mt-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-primary transition-colors p-8 text-center cursor-pointer"
                            @click="fileInput?.click()">
                            <Icon name="ph:file-csv" class="mx-auto h-10 w-10 text-slate-300" />
                            <p class="mt-2 text-sm text-slate-600">Klik for at vælge en CSV-fil</p>
                            <p v-if="state.fileName" class="mt-2 text-sm font-medium text-primary">{{ state.fileName }}</p>
                            <input ref="fileInput" type="file" accept=".csv,text/csv" class="hidden" @change="handleFile" />
                        </div>
                    </div>

                    <!-- Step 2: map columns -->
                    <div v-else-if="state.step === 'map'">
                        <p class="text-sm text-slate-600">
                            Kobl dine kolonner ({{ state.headers.length }} fundet, {{ state.rows.length }} rækker) til CitizenOne-felterne.
                            Vi har gættet ud fra kolonnenavnene — ret hvor nødvendigt.
                        </p>
                        <div class="mt-4 space-y-2 max-h-80 overflow-y-auto pr-1">
                            <div v-for="field in targetFields" :key="field.key"
                                class="flex items-center justify-between gap-x-3 rounded-lg border border-slate-100 px-3 py-2">
                                <span class="text-sm text-slate-800 w-1/2">
                                    {{ field.label }}
                                    <span v-if="field.required" class="text-red-500">*</span>
                                </span>
                                <select v-model="state.mapping[field.key]"
                                    class="w-1/2 rounded-md border border-slate-200 px-2 py-1.5 text-sm focus:border-primary focus:ring-primary">
                                    <option :value="-1">— Ignorér —</option>
                                    <option v-for="(h, i) in state.headers" :key="i" :value="i">{{ h }}</option>
                                </select>
                            </div>
                        </div>
                        <p v-if="!requiredMapped" class="mt-3 text-xs text-amber-600">
                            Fornavn og efternavn skal kobles for at kunne importere.
                        </p>
                    </div>

                    <!-- Step 3: preview -->
                    <div v-else-if="state.step === 'preview'">
                        <p class="text-sm text-slate-600">Forhåndsvisning af de første {{ previewRows.length }} af {{ state.rows.length }} rækker. Ser det rigtigt ud?</p>
                        <div class="mt-3 overflow-x-auto rounded-lg border border-slate-100">
                            <table class="min-w-full text-xs">
                                <thead class="bg-slate-50">
                                    <tr>
                                        <th v-for="field in mappedFields" :key="field.key" class="px-2 py-1.5 text-left font-medium text-slate-500 whitespace-nowrap">{{ field.label }}</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-100">
                                    <tr v-for="(row, ri) in previewRows" :key="ri">
                                        <td v-for="field in mappedFields" :key="field.key" class="px-2 py-1.5 text-slate-700 whitespace-nowrap">{{ cell(row, field.key) }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Step 4: done / summary -->
                    <div v-else-if="state.step === 'done'" class="text-center py-2">
                        <Icon name="ph:check-circle-fill" class="mx-auto h-12 w-12 text-emerald-500" />
                        <p class="mt-2 text-lg font-semibold text-slate-900">{{ state.summary?.created ?? 0 }} importeret</p>
                        <p v-if="summaryUnmatched > 0" class="mt-1 text-sm text-amber-600">
                            {{ summaryUnmatched }} række(r) kunne ikke matches og blev sprunget over.
                        </p>
                        <p v-else class="mt-1 text-sm text-slate-500">Alle rækker blev importeret.</p>
                        <div v-if="summaryUnmatched > 0" class="mt-3 text-left text-xs text-slate-500 max-h-40 overflow-y-auto rounded-lg bg-slate-50 p-3">
                            <p v-if="state.summary?.unmatched?.length"><strong>Ikke-matchede CPR:</strong> {{ state.summary.unmatched.join(', ') }}</p>
                            <p v-if="state.summary?.unmatched_employee?.length"><strong>Ikke-matchede e-mails:</strong> {{ state.summary.unmatched_employee.join(', ') }}</p>
                            <p v-if="state.summary?.unmatched_shift?.length"><strong>Ukendte vagttyper:</strong> {{ state.summary.unmatched_shift.join(', ') }}</p>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="mt-6 flex justify-between gap-x-3">
                        <FormButton buttonStyle="cancel" @click="back">
                            {{ state.step === 'type' ? $t('cancel') : (state.step === 'done' ? 'Luk' : 'Tilbage') }}
                        </FormButton>
                        <FormButton v-if="state.step === 'map'" buttonStyle="primary" :disabled="!requiredMapped" @click="state.step = 'preview'">
                            Forhåndsvis
                        </FormButton>
                        <FormButton v-else-if="state.step === 'preview'" buttonStyle="primary" @click="runImport">
                            Importér {{ state.rows.length }} {{ entity.label.toLowerCase() }}
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
        key: 'citizens', label: 'Børn / borgere', icon: 'ph:users-three', available: true, mode: 'file',
        importFn: (fd: FormData) => citizenService.importCitizens(fd),
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
        key: 'employees', label: 'Ansatte', icon: 'ph:identification-badge', available: true, mode: 'file',
        importFn: (fd: FormData) => userService.importEmployees(fd),
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
    step: 'type' as 'type' | 'upload' | 'map' | 'preview' | 'done',
    entityKey: 'citizens',
    fileName: '',
    headers: [] as string[],
    rows: [] as string[][],
    mapping: {} as Record<string, number>,
    summary: null as any,
    error: '',
    isLoading: false,
})

const summaryUnmatched = computed(() => (state.summary?.unmatched_count ?? 0)
    + (state.summary?.unmatched_employee_count ?? 0) + (state.summary?.unmatched_shift_count ?? 0))

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

function handleFile(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    state.error = ''
    state.fileName = file.name
    const reader = new FileReader()
    reader.onload = () => {
        try {
            const text = String(reader.result ?? '')
            const firstLine = text.split(/\r?\n/)[0] ?? ''
            const delimiter = detectDelimiter(firstLine)
            const all = parseCsv(text, delimiter)
            if (all.length < 2) { state.error = 'Filen ser tom ud eller har ingen datarækker.'; return }
            state.headers = all[0].map(h => h.trim())
            state.rows = all.slice(1)
            autoGuess()
            state.step = 'map'
        } catch (err) {
            state.error = 'Kunne ikke læse filen. Tjek at det er en gyldig CSV.'
        }
    }
    reader.readAsText(file, 'UTF-8')
}

function buildCsv(): string {
    const esc = (v: string) => /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v
    const heading = targetFields.value.map(f => f.key).join(',')
    const lines = state.rows.map(row =>
        targetFields.value.map(f => {
            const idx = state.mapping[f.key] ?? -1
            return esc(idx < 0 ? '' : (row[idx] ?? '').trim())
        }).join(','))
    return [heading, ...lines].join('\n')
}

async function runImport() {
    state.isLoading = true
    state.error = ''
    try {
        if (entity.value.mode === 'json') {
            // Relational entities (journals/schedules) post mapped rows as JSON;
            // the backend matches to citizen/employee and returns a summary.
            const rows = state.rows.map(row => {
                const obj: Record<string, string> = {}
                targetFields.value.forEach(f => {
                    const idx = state.mapping[f.key] ?? -1
                    obj[f.key] = idx < 0 ? '' : (row[idx] ?? '').trim()
                })
                return obj
            })
            const response = await entity.value.importFn({ rows })
            state.summary = response ?? {}
            emit('imported', state.entityKey)
            state.step = 'done'
        } else {
            const csv = buildCsv()
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

function back() {
    if (state.step === 'preview') state.step = 'map'
    else if (state.step === 'map') { resetFile(); state.step = 'upload' }
    else if (state.step === 'upload') { resetFile(); state.step = 'type' }
    else closeModal()
}

function resetFile() {
    state.fileName = ''; state.headers = []; state.rows = []; state.mapping = {}; state.error = ''
}

function closeModal() {
    resetFile(); state.step = 'type'; state.entityKey = 'citizens'; state.summary = null
    emit('close')
}
</script>
