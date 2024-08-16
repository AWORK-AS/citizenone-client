<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('news.newNews') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

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

const state = reactive({
    error: {} as Error,
    formNews: {
        image: '',
        title: '',
        link: '',
        content: '',
        is_active: false,
    },
    isPageLoading: false,
})

async function saveNews(newsDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        let params = new FormData()
        params.append('image', newsDetails.image)
        params.append('title', newsDetails.title)
        params.append('link', newsDetails.link)
        params.append('content', newsDetails.content)
        params.append('is_active', newsDetails.is_active)
        const response = await newsService.saveNews(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('news.form.alert.newNewsSuccessfullySaved')}.`)
            navigateTo('/news')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>