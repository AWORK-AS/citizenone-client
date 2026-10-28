<template>
    <div>
        <Modal size="xs" :title="$t('filter')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <form @submit.prevent="submitForm()" id="journalNotesFilterForm">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="space-y-3">
                        <fieldset>
                            <legend class="text-sm text-gray-600">{{ $t('citizens.citizenJournals.filter.view') }}</legend>
                            <RadioGroup v-model="state.filter.selectedView" class="mt-1 flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
                                <RadioGroupOption as="template" v-for="viewFilter in state.options.viewFilterLists"
                                    :key="viewFilter.id" :value="viewFilter" v-slot="{ checked }">
                                    <button type="button"
                                        :class="[checked ? 'bg-white text-primary shadow-xs ring-1 ring-slate-200' : 'text-slate-600 hover:text-slate-900', 'flex-auto rounded-md px-3 py-1.5 text-xs font-medium transition-colors']">
                                        {{ viewLabel(viewFilter.title) }}
                                    </button>
                                </RadioGroupOption>
                            </RadioGroup>
                        </fieldset>
                        <!-- One citizen and one department: that is what the overview filters on. -->
                        <div class="space-y-1">
                            <label for="citizen_filter" class="text-sm text-gray-600">{{ $t('journalNotes.citizen') }}</label>
                            <FormSelect id="citizen_filter" :options="props.citizenOptions" :searchable="true"
                                :appendToBody="true" v-model="state.filter.citizen" />
                        </div>
                        <div v-if="state.options.departments.length > 1" class="space-y-1">
                            <label for="department_filter" class="text-sm text-gray-600">{{ $t('journalNotes.department') }}</label>
                            <FormSelect id="department_filter" :options="state.options.departments"
                                :appendToBody="true" v-model="state.filter.department" />
                        </div>
                        <div class="space-y-1">
                            <label for="assessment_filter" class="text-sm text-gray-600">{{ $t('journalNotes.assessment') }}</label>
                            <FormSelect id="assessment_filter" :options="assessmentOptions" :searchable="false"
                                :appendToBody="true" v-model="state.filter.assessment" />
                        </div>
                        <div class="space-y-1">
                            <label for="tags" class="text-sm text-gray-600">{{ $t('journalNoteTags.journalNoteTags') }}</label>
                            <FormSelectMultiple id="tags" :options="state.options.tags" :appendToBody="true" v-model="state.filter.tags" />
                        </div>
                        <div class="space-y-1">
                            <label for="created_by" class="text-sm text-gray-600">{{ $t('journalNoteTags.createdBy') }}</label>
                            <FormSelectMultiple id="created_by" :options="state.options.users"
                                :appendToBody="true" v-model="state.filter.created_by" />
                        </div>
                    </div>
                    <div class="mt-6 space-y-3">
                        <button v-if="hasAny" type="button" @click="clearAll"
                            class="text-sm text-slate-500 hover:text-slate-800">
                            {{ $t('citizens.citizenJournals.filter.resetFilters') }}
                        </button>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" @click="closeModal()">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="submit" buttonStyle="primary">
                                {{ $t('filter') }}
                            </FormButton>
                        </div>
                    </div>
                </form>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { journalNoteTagService } from '@/components/api/user/JournalNoteTagService'
import { departmentService } from '@/components/api/user/DepartmentService'
import { userService } from '@/components/api/user/UserService'
import { RadioGroup, RadioGroupOption } from '@headlessui/vue'
import { useCitizenJournalStore } from '@/store/citizen-journal'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const { t } = useI18n()

const customPagesStore = useCustomPagesStore() as any
const citizenJournalStore = useCitizenJournalStore()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    citizenOptions: {
        type: Array as any,
        default: () => [],
    },
    // What the page filters on now. Each opening starts from it, so Cancel drops
    // the edits and a reset on the page clears the form too.
    applied: {
        type: Object as any,
        default: () => ({}),
    },
})
const emit = defineEmits(['close', 'setFilter'])

type JournalNotesFilter = { assessment: string, citizen: string, department: string, tags: string[], created_by: string[] }
type JournalNotesFilterChip = { key: keyof JournalNotesFilter, value: string, label: string }

function emptyFilter(): JournalNotesFilter {
    return { assessment: '', citizen: '', department: '', tags: [], created_by: [] }
}

const state = reactive({
    error: {} as Error,
    filter: {
        ...emptyFilter(),
        selectedView: citizenJournalStore.getFilterView as any,
    } as any,
    isPageLoading: false,
    options: {
        departments: [] as any,
        tags: [] as any,
        viewFilterLists: [
            { id: 1, title: 'Standard view' },
            { id: 2, title: 'Journal note view' },
            { id: 3, title: 'Risk assessment view' },
        ],
        users: [] as any,
    }
})

const assessmentOptions = computed(() => [
    { value: 'no risk', label: t('citizens.citizenJournals.form.risk.noRisk') },
    { value: 'increased risk', label: t('citizens.citizenJournals.form.risk.increasedRisk') },
    { value: 'acute increased risk', label: t('citizens.citizenJournals.form.risk.acuteIncreasedRisk') },
])

// A company that never named its risk page still gets a label, not an empty option.
function viewLabel(title: string) {
    if (title === 'Journal note view') return t('citizens.citizenJournals.filter.journalNoteView')
    if (title === 'Risk assessment view') return customPagesStore.getCustomPagesName?.riskAssessment || t('citizens.citizenJournals.filter.riskAssessmentView')
    return t('citizens.citizenJournals.filter.standardView')
}

const hasAny = computed(() => chipsFor(state.filter).length > 0)

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) {
        const applied = props.applied ?? {}
        state.filter = {
            ...emptyFilter(),
            ...applied,
            tags: [...(applied.tags ?? [])],
            created_by: [...(applied.created_by ?? [])],
            selectedView: state.options.viewFilterLists.find((item: any) => item.title === citizenJournalStore.getFilterView)
                ?? state.options.viewFilterLists[0],
        }
    }
})

function clearAll() {
    state.filter = { ...emptyFilter(), selectedView: state.filter.selectedView }
}

/** One removable pill per value, labelled the way the form shows it. */
function chipsFor(filter: any): JournalNotesFilterChip[] {
    const label = (options: any[], value: string) => options.find((o: any) => o.value === value)?.label ?? value
    const chips: JournalNotesFilterChip[] = []
    if (filter.citizen) chips.push({ key: 'citizen', value: filter.citizen, label: label(props.citizenOptions, filter.citizen) })
    if (filter.department) chips.push({ key: 'department', value: filter.department, label: filter.department })
    if (filter.assessment) chips.push({ key: 'assessment', value: filter.assessment, label: label(assessmentOptions.value, filter.assessment) })
    for (const tag of filter.tags ?? []) chips.push({ key: 'tags', value: tag, label: label(state.options.tags, tag) })
    for (const user of filter.created_by ?? []) chips.push({ key: 'created_by', value: user, label: label(state.options.users, user) })
    return chips
}

function closeModal() {
    emit('close')
}

onMounted(() => {
    fetchAllJournalNoteTags()
    fetchAllDepartments()
    fetchAllUsersWithoutAllUsersOption()
})

async function fetchAllJournalNoteTags() {
    state.error = {}
    try {
        const response = await journalNoteTagService.getAllJournalNoteTags({})
        if (response.data) {
            state.options.tags = response.data.map((tag: any) => ({
                value: tag?.uuid,
                label: tag?.name,
            }))
        }
    } catch (error: any) {
        state.error = error
    }
}

async function fetchAllDepartments() {
    state.error = {}
    try {
        const response = await departmentService.getAllDepartments({})
        if (response.data) {
            state.options.departments = response.data.map((dept: any) => ({
                value: dept?.name,
                label: dept?.name,
            }))
        }
    } catch (error: any) {
        state.error = error
    }
}

async function fetchAllUsersWithoutAllUsersOption() {
    state.error = {}
    try {
        const response = await userService.getAllUsersWithoutAllUsersOption()
        if (response.data) {
            state.options.users = response.data.map((user: any) => ({
                value: user?.uuid,
                label: user?.firstname + ' ' + (user?.lastname ?? ''),
            }))
        }
    } catch (error: any) {
        state.error = error
    }
}

function submitForm() {
    const { selectedView, ...filter } = state.filter
    emit('setFilter', { selectedView, filter: { ...emptyFilter(), ...filter, citizen: filter.citizen ?? '', department: filter.department ?? '', assessment: filter.assessment ?? '' }, chips: chipsFor(state.filter) })
    closeModal()
}
</script>
