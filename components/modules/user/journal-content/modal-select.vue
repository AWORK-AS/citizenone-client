<template>
    <div>
        <Modal size="xs" :title="$t('journalcontents.selectjournalcontent')"
                         :show="props.isModalOpen"
                         @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="space-y-3">
                        <div class="space-y-1">
                            <div class="flex justify-between items-center py-0.5">
                                <FormLabel for="newcontent" :label="$t('journalcontents.form.newjournalcontentname')" />
                                <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                                    @click="state.modal.isAddJournalContentOpen = true">
                                    {{ $t('journalcontents.newjournalcontent') }}
                                </span>
                            </div>
                            <FormSelect id="predefined_content"
                                        v-model="state.selectedJournalContentUuid"
                                        :options="state.options.journal_contents" />
                            <FormError :error="props?.error?.errors?.content?.[0]" />
                        </div>
                    </div>
                    <div class="mt-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="closeModal">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="primary" class="rounded-md" @click="selectContent">
                                {{ $t('select') }}
                            </FormButton>
                        </div>
                    </div>
                </LoadingSpinner>
            </template>
        </Modal>

        <ModulesUserJournalContentModalNew
            :isModalOpen="state.modal.isAddJournalContentOpen"
            @close="state.modal.isAddJournalContentOpen = false"
            @refreshJournalContents="fetchJournalContents" />
    </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { t } = useI18n()

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})

const emit = defineEmits(['close', 'select'])

const state = reactive({
    error: {} as Error,
    modal: {
        isAddJournalContentOpen: false,
    },
    selectedJournalContentUuid: '' as string,
    options: {
        journal_contents: [] as any,
    },
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function selectContent() {
    const selected = state.options.journal_contents.find(
        (item: any) => item.value === state.selectedJournalContentUuid
    )
    if (selected) {
        emit('select', selected)
        closeModal()
    }
}

async function fetchJournalContents() {
    state.isPageLoading = true
    try {
        // TODO: Replace with journalContentService.fetchJournalContents() when API is ready
        // Expected response: array of { uuid, title, content }
        // Map to options format: { value: item.uuid, label: item.title, content: item.content }
        console.log('Fetch journal contents')
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

watch(() => props.isModalOpen, (newValue) => {
    if (newValue) {
        fetchJournalContents()
    }
})
</script>