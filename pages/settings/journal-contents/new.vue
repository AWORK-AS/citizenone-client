<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('journalContents.newJournalContent') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('journalContents.newJournalContent') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/settings/journal-contents">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserJournalContentForm formType="create" :selectedJournalContent="state.formJournalContent"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="saveJournalContent" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { journalContentService } from '@/components/api/user/JournalContentService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const breadcrumbLinks = [
    {
        name: 'journalContents.journalContents',
        translate: true,
        href: '/settings/journal-contents',
    },
    {
        name: 'journalContents.newJournalContent',
        translate: true,
        href: '/settings/journal-contents/new',
    },
]

const state = reactive({
    error: {} as Error,
    formJournalContent: {
        name: '',
        content: '',
    },
    isPageLoading: false,
})

async function saveJournalContent(journalContentDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: journalContentDetails.name,
            content: journalContentDetails.content,
        }
        const response = await journalContentService.saveJournalContent(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('journalContents.form.alert.newJournalContentSuccessfullySaved')}.`)
            navigateTo('/settings/journal-contents')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
