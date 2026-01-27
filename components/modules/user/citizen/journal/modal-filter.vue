<template>
    <div>
        <Modal size="xs" :title="$t('filter')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <form @submit.prevent="submitForm()" id="journalFilterForm">
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
                                        :class="[active ? 'border-primary ring-1 ring-primary' : 'border-gray-300', 'relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-xs focus:outline-hidden']">
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
                                            :class="[active ? 'border' : 'border-1', checked ? 'border-primary' : 'border-transparent', 'pointer-events-none absolute -inset-px rounded-lg']"
                                            aria-hidden="true" />
                                    </div>
                                </RadioGroupOption>
                            </RadioGroup>
                        </fieldset>
                        <div class="space-y-1">
                            <p class="text-sm text-gray-600">
                                {{ $t('journalNoteTags.journalNoteTags') }}
                            </p>
                            <FormSelectMultiple id="tags" :options="state.options.tags" v-model="state.filter.tags" />
                        </div>
                        <div class="space-y-1">
                            <p class="text-sm text-gray-600">
                                {{ $t('journalNoteTags.createdBy') }}
                            </p>
                            <FormSelectMultiple id="created_by" :options="state.options.users"
                                v-model="state.filter.created_by" />
                        </div>
                    </div>
                    <div class="mt-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="closeModal()">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="submit" buttonStyle="primary" class="rounded-md">
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
import { userService } from '@/components/api/user/UserService'
import { RadioGroup, RadioGroupOption } from '@headlessui/vue'
import { useCitizenJournalStore } from '@/store/citizen-journal'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useDepartmentStore } from '@/store/department'
import type { Error } from '@/types'

const customPagesStore = useCustomPagesStore() as any
const departmentStore = useDepartmentStore() as any
const citizenJournalStore = useCitizenJournalStore()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close', 'setFilter'])

const state = reactive({
    error: {} as Error,
    filter: {
        created_by: [],
        selectedView: citizenJournalStore.getFilterView as any,
        tags: [],
    },
    isPageLoading: false,
    options: {
        tags: [],
        viewFilterLists: [
            { id: 1, title: 'Standard view' },
            { id: 2, title: 'Journal note view' },
            { id: 3, title: 'Risk assessment view' },
        ],
        users: [],
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
    fetchAllUsersWithoutAllUsersOption()
})

async function fetchAllJournalNoteTags() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            department: departmentStore.getSelectedDepartmentName,
        }
        const response = await journalNoteTagService.getAllJournalNoteTags(params)
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (tag: any) => options.push({
                    value: tag?.uuid,
                    label: tag?.name,
                })
            )
            state.options.tags = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchAllUsersWithoutAllUsersOption() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await userService.getAllUsersWithoutAllUsersOption()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (user: any) => options.push({
                    value: user?.uuid,
                    label: user?.firstname + " " + user?.lastname,
                })
            )
            state.options.users = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function submitForm() {
    emit('setFilter', state.filter)
    closeModal()
}
</script>

<style>
#journalFilterForm .multiselect-dropdown {
    max-height: 5rem !important;
}
</style>