<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.news.editUser') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.news.editUser') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/superadmin/news">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesSuperadminNewsForm formType="update" :selectedNews="state.formNews" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="updateNews" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { newsService } from '@/components/api/superadmin/NewsService'
import { useI18n } from "vue-i18n"
import { notify } from "@kyvg/vue3-notification"
import type { UserForm, Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()
const router = useRouter()
const uuid = router?.currentRoute?.value?.params?.uuid

const state = reactive({
    error: {} as Error,
    formNews: {
        image: '',
        title: '',
        content: '',
        is_active: false,
    },
    isPageLoading: false,
})

onMounted(() => {
    fetchNews()
})

async function fetchNews() {
    state.isPageLoading = true
    state.error = {}
    try {
        const response = await newsService.getSelectedNews(uuid)
        if (response) {
            state.formNews = {
                image: response?.data?.image ?? '',
                title: response?.data?.title ?? '',
                content: response?.data?.content ?? '',
                is_active: response?.data?.is_active ?? '',
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateNews(newsDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        let params = new FormData()
        params.append('image', newsDetails.image)
        params.append('title', newsDetails.title)
        params.append('content', newsDetails.content)
        params.append('is_active', newsDetails.is_active)
        const response = await newsService.updateNews(uuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('superadmin.news.form.alert.newsSuccessfullyUpdated')}.`)
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