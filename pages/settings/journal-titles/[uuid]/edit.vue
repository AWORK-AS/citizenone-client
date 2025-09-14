<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('journalTitles.editJournalTitle') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('journalTitles.editJournalTitle') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/settings/journal-titles">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserJournalTitleForm formType="update" :selectedJournalTitle="state.formJournalTitle"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="updateJournalTitle" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { journalTitleService } from '@/components/api/user/JournalTitleService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const journalTitleUuid = router?.currentRoute?.value?.params?.uuid
const breadcrumbLinks = [
    {
        name: 'journalTitles.journalTitles',
        translate: true,
        href: '/settings/journal-titles',
    },
    {
        name: 'journalTitles.editJournalTitle',
        translate: true,
        href: `/settings/journal-titles/${journalTitleUuid}/edit`,
    },
]

const state = reactive({
    error: {} as Error,
    formJournalTitle: {
        title: '',
    },
    isPageLoading: false,
})

onMounted(() => {
    fetchJournalTitle()
})

async function fetchJournalTitle() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await journalTitleService.getJournalTitle(journalTitleUuid)
        if (response) {
            state.formJournalTitle = {
                title: response?.data?.title ?? '',
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateJournalTitle(journalTitleDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            title: journalTitleDetails.title,
        }
        const response = await journalTitleService.updateJournalTitle(journalTitleUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('journalTitles.form.alert.journalTitleSuccessfullyUpdated')}.`)
            navigateTo('/settings/journal-titles')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>