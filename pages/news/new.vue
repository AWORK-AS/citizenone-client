<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('news.newNews') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('news.newNews') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/news">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesNewsForm formType="create" :selectedNews="state.formNews" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="saveNews" />
                </LoadingSpinner>
                <DialogConfirmation :isModalOpen="state.modal.isUpgradeStorageOpen"
                    :title="$t('citizens.documents.upgradeStorage')"
                    :message="state.error?.message + ' ' + $t('citizens.documents.confirmation.upgradeStorageConfirmation') + '?'"
                    @close="closeUpgradeStorageModal" @confirm="navigateTo(`/storage/upgrade`)" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { newsService } from '@/components/api/NewsService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const breadcrumbLinks = [
    {
        name: 'bulletBoard.bulletBoard',
        translate: true,
        href: '/news',
    },
    {
        name: 'news.newNews',
        translate: true,
        href: '/news/new',
    },
]

const state = reactive({
    error: {} as Error,
    formNews: {
        image: '',
        title: '',
        link: '',
        content: '',
        audience: [],
        department: [],
        is_featured: false,
        is_active: false,
    },
    isPageLoading: false,
    modal: {
        isUpgradeStorageOpen: false
    },
})

function closeUpgradeStorageModal() {
    state.modal.isUpgradeStorageOpen = false
    state.error = {}
}

async function saveNews(newsDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        let params = new FormData()
        params.append('image', newsDetails.image)
        params.append('title', newsDetails.title)
        params.append('link', newsDetails.link)
        params.append('content', newsDetails.content)
        params.append('audience_uuid', JSON.stringify(newsDetails.audience))
        params.append('department_uuid', JSON.stringify(newsDetails.department))
        params.append('is_featured', newsDetails.is_featured)
        params.append('is_active', newsDetails.is_active)
        const response = await newsService.saveNews(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('news.form.alert.newNewsSuccessfullySaved')}.`)
            navigateTo('/news')
        }
    } catch (error: any) {
        state.error = error
        if (error?.message === 'You do not have enough storage space to upload new files.') {
            state.modal.isUpgradeStorageOpen = true
        } else if (error?.message === 'Du har ikke nok lagerplads til at uploade nye filer.') {
            state.modal.isUpgradeStorageOpen = true
        }
    }
    state.isPageLoading = false
}
</script>