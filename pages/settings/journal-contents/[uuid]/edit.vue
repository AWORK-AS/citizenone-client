<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('journalcontents.editJournalContent') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('journalcontents.editJournalContent') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/settings/journal-contents">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserJournalContentForm formType="update" :selectedJournalContent="state.formJournalContent"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="updateJournalContent" />
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
const router = useRouter()
const journalContentUuid = router?.currentRoute?.value?.params?.uuid
const breadcrumbLinks = [
    {
        name: 'journalcontents.journalContents',
        translate: true,
        href: '/settings/journal-contents',
    },
    {
        name: 'journalcontents.editJournalContent',
        translate: true,
        href: `/settings/journal-contents/${journalContentUuid}/edit`,
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

onMounted(() => {
    fetchJournalContent()
})

async function fetchJournalContent() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await journalContentService.getJournalContent(journalContentUuid)
        if (response) {
            state.formJournalContent = {
                name: response?.data?.name ?? '',
                content: response?.data?.content ?? '',
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateJournalContent(journalContentDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: journalContentDetails.name,
            content: journalContentDetails.content,
        }
        const response = await journalContentService.updateJournalContent(journalContentUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('journalcontents.form.alert.journalContentSuccessfullyUpdated')}.`)
            navigateTo('/settings/journal-contents')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
