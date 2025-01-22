<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('journalNoteTags.editJournalNoteTag') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>{{ $t('journalNoteTags.editJournalNoteTag') }}</template>
            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                to="/settings/journal-note-tags">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>
            <LoadingSpinner :isActive="state.isPageLoading">
                <ModulesJournalNoteTagsForm formType="update" :selectedTag="state.formJournalNoteTag"
                    :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                    @submitForm="updateTag" />
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
const router = useRouter()
const journalNoteTagUuid = router?.currentRoute?.value?.params?.uuid

const state = reactive({
    error: {} as Error,
    formJournalNoteTag: {
        name: '',
        color: ''
    },
    isPageLoading: false,
})

onMounted(() => {
    fetchTag()
})

async function fetchTag() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await journalNoteTagService.getJournalNoteTag(journalNoteTagUuid)
        if (response) {
            state.formJournalNoteTag = {
                name: response?.data?.name ?? '',
                color: response?.data?.color ?? ''
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateTag(journalDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: journalDetails.name,
            color: journalDetails.color
        }
        const response = await journalNoteTagService.updateJournal(journalNoteTagUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('journalNoteTags.form.alert.journalTagSuccessfullyUpdated')}.`)
            navigateTo('/settings/journal-note-tags')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>