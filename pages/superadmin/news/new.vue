<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.news.newNews') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.news.newNews') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/superadmin/news">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesSuperadminNewsForm formType="create" :selectedNews="state.formNews" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="saveNews" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { newsService } from '@/components/api/superadmin/NewsService'
import { useI18n } from "vue-i18n"
import { notify } from "@kyvg/vue3-notification"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
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
            successAlert(`${t('alert.success')}!`, `${t('superadmin.news.form.alert.newNewsSuccessfullySaved')}.`)
            navigateTo('/superadmin/news')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function successAlert(title: string, message: string) {
    notify({
        title: title,
        text: message,
        type: 'success',
    })
}
</script>