<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('journalNoteTags.addNewTag') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('journalNoteTags.addNewTag') }}</template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                to="/settings/journal-note-tags">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>
            <LoadingSpinner :isActive="state.isPageLoading">
                <ModulesJournalNoteTagsForm formType="create" :selectedJournalNoteTag="state.formJournalNoteTag"
                    :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                    @submitForm="saveJournalNoteTag" />
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { journalNoteTagService } from '@/components/api/JournalNoteTagService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formJournalNoteTag: {
        name: '',
        color: '#000000',
    },
    isPageLoading: false,
})

async function saveJournalNoteTag(journalNoteTagDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: journalNoteTagDetails.name,
            color: journalNoteTagDetails.color,
        }
        const response = await journalNoteTagService.saveJournalNoteTag(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('journalNoteTags.form.alert.newJournalTagSuccessfullySaved')}.`)
            navigateTo('/settings/journal-note-tags')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>