<template>
    <div>
        <Modal size="xs" :title="$t('journalContents.selectJournalContent')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div id="formSelectJournalContent" class="space-y-3">
                        <div class="space-y-1">
                            <div class="flex justify-between items-center py-0.5">
                                <FormLabel for="predefined_content" :label="$t('journalContents.form.name')" />
                                <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                                    @click="state.modal.isAddJournalContentOpen = true">
                                    {{ $t('journalContents.newJournalContent') }}
                                </span>
                            </div>
                            <FormSelect id="predefined_content" v-model="state.selectedJournalContentUuid"
                                :options="state.options.journal_contents" />
                            <FormError :error="props?.error?.errors?.content?.[0]" />
                        </div>
                    </div>
                    <div class="mt-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" @click="closeModal">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="primary" @click="selectContent">
                                {{ $t('select') }}
                            </FormButton>
                        </div>
                    </div>
                </LoadingSpinner>
                <ModulesUserJournalContentModalNew :isModalOpen="state.modal.isAddJournalContentOpen"
                    @close="state.modal.isAddJournalContentOpen = false"
                    @refreshJournalContents="fetchJournalContents" />
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { journalContentService } from '@/components/api/user/JournalContentService'
import type { Error } from '@/types'
import { useI18n } from 'vue-i18n'

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
const { t } = useI18n()

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

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) {
        fetchJournalContents()
    }
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
        // The list comes in pages of ten; the picker needs every text.
        const items: any[] = []
        let page = 1
        let lastPage = 1
        do {
            const response = await journalContentService.getJournalContents({ page })
            items.push(...(response?.data ?? []))
            lastPage = response?.meta?.last_page ?? response?.last_page ?? 1
            page++
        } while (page <= lastPage)
        state.options.journal_contents = items.map((item: any) => ({
            value: item.uuid,
            // A text with choice lists asks for options when inserted; say so.
            label: item.choice_lists_count > 0 ? `${item.name} · ${t('journalContents.choices.badge')}` : item.name,
            content: item.content,
        }))
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>

<style>
#formSelectJournalContent .multiselect-dropdown {
    max-height: 4.8rem !important;
}
</style>