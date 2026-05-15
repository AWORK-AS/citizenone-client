<template>
    <div>
        <Modal size="xs" :title="$t('filter')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <form @submit.prevent="submitForm()" id="journalNotesFilterForm">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="space-y-3">
                        <fieldset>
                            <RadioGroup v-model="state.filter.selectedView"
                                class="mt-6 grid grid-cols-1 gap-y-6 sm:grid-cols-1 sm:gap-x-4">
                                <RadioGroupOption as="template" v-for="viewFilter in state.options.viewFilterLists"
                                    :key="viewFilter.id" :value="viewFilter" :aria-label="viewFilter.title"
                                    v-slot="{ active, checked }">
                                    <div
                                        :class="[active ? 'border-primary ring-1 ring-primary' : 'border-gray-300', 'relative flex cursor-pointer rounded-full border bg-white p-4 shadow-xs focus:outline-hidden']">
                                        <span class="flex flex-1">
                                            <span class="flex flex-col">
                                                <p class="block text-sm font-medium text-gray-900">
                                                    <span v-if="viewFilter.title === 'Standard view'">
                                                        {{ $t('citizens.citizenJournals.filter.standardView') }}
                                                    </span>
                                                    <span v-if="viewFilter.title === 'Journal note view'">
                                                        {{ $t('citizens.citizenJournals.filter.journalNoteView') }}
                                                    </span>
                                                    <span v-if="viewFilter.title === 'Risk assessment view'">
                                                        {{ customPagesStore.getCustomPagesName?.riskAssessment }}
                                                    </span>
                                                </p>
                                            </span>
                                        </span>
                                        <Icon name="ph:check-circle"
                                            :class="[!checked ? 'invisible' : '', 'size-5 text-primary']"
                                            aria-hidden="true" />
                                        <span
                                            :class="[active ? 'border' : 'border-1', checked ? 'border-primary' : 'border-transparent', 'pointer-events-none absolute -inset-px rounded-full']"
                                            aria-hidden="true" />
                                    </div>
                                </RadioGroupOption>
                            </RadioGroup>
                        </fieldset>
                        <div class="space-y-1">
                            <p class="text-sm text-gray-600">
                                {{ $t('journalNotes.citizen') }}
                            </p>
                            <FormSelectMultiple id="citizen_filter" :options="props.citizenOptions"
                                :appendToBody="true" v-model="state.filter.citizens" />
                        </div>
                        <div class="space-y-1">
                            <p class="text-sm text-gray-600">
                                {{ $t('journalNotes.department') }}
                            </p>
                            <FormSelectMultiple id="department_filter" :options="state.options.departments"
                                :appendToBody="true" v-model="state.filter.departments" />
                        </div>
                        <div class="space-y-1">
                            <p class="text-sm text-gray-600">
                                {{ $t('journalNotes.assessment') }}
                            </p>
                            <select v-model="state.filter.assessment"
                                class="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm shadow-xs focus:border-primary focus:outline-hidden focus:ring-1 focus:ring-primary">
                                <option value="">-</option>
                                <option value="no risk">{{ $t('citizens.citizenJournals.form.risk.noRisk') }}</option>
                                <option value="increased risk">{{ $t('citizens.citizenJournals.form.risk.increasedRisk') }}</option>
                                <option value="acute increased risk">{{ $t('citizens.citizenJournals.form.risk.acuteIncreasedRisk') }}</option>
                            </select>
                        </div>
                        <div class="space-y-1">
                            <p class="text-sm text-gray-600">
                                {{ $t('journalNoteTags.journalNoteTags') }}
                            </p>
                            <FormSelectMultiple id="tags" :options="state.options.tags" :appendToBody="true" v-model="state.filter.tags" />
                        </div>
                        <div class="space-y-1">
                            <p class="text-sm text-gray-600">
                                {{ $t('journalNoteTags.createdBy') }}
                            </p>
                            <FormSelectMultiple id="created_by" :options="state.options.users"
                                :appendToBody="true" v-model="state.filter.created_by" />
                        </div>
                    </div>
                    <div class="mt-6">
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
import type { Error } from '@/types'

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
})
const emit = defineEmits(['close', 'setFilter'])

const state = reactive({
    error: {} as Error,
    filter: {
        assessment: '',
        citizens: [] as any,
        created_by: [] as any,
        departments: [] as any,
        selectedView: citizenJournalStore.getFilterView as any,
        tags: [] as any,
    },
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

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) {
        state.filter.selectedView = state.options.viewFilterLists.find((item: any) => item.title === citizenJournalStore.getFilterView)
    }
})

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
    emit('setFilter', state.filter)
    closeModal()
}
</script>

<style>
#journalNotesFilterForm .multiselect-dropdown {
    max-height: 5rem !important;
}
</style>
