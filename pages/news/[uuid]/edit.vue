<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('news.editNews') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('news.editNews') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/news">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserNewsForm formType="update" :selectedNews="state.formNews" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="updateNews" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { newsService } from '@/components/api/user/NewsService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const newsUuid = router?.currentRoute?.value?.params?.uuid
const breadcrumbLinks = [
    {
        name: 'bulletBoard.bulletBoard',
        translate: true,
        href: '/news',
    },
    {
        name: 'news.editNews',
        translate: true,
        href: `/news/${newsUuid}/edit`,
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
    } as any,
    isPageLoading: false,
})

onMounted(() => {
    fetchNews()
})

async function fetchNews() {
    state.isPageLoading = true
    state.error = {}
    try {
        const response = await newsService.getSelectedNews(newsUuid)
        if (response) {
            state.formNews = {
                image: response?.data?.image ?? '',
                title: response?.data?.title ?? '',
                link: response?.data?.link ?? '',
                content: response?.data?.content ?? '',
                audience: [],
                department: [],
                is_featured: response?.data?.is_featured ?? '',
                is_active: response?.data?.is_active ?? '',
            }
            response?.data?.audiences?.forEach((department: any) => {
                state.formNews.audience.push(department?.uuid)
            })
            response?.data?.departments?.forEach((department: any) => {
                state.formNews.department.push(department?.uuid)
            })
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
        params.append('link', newsDetails.link)
        params.append('content', newsDetails.content)
        params.append('audience_uuid', JSON.stringify(newsDetails.audience))
        params.append('department_uuid', JSON.stringify(newsDetails.department))
        params.append('is_featured', newsDetails.is_featured)
        params.append('is_active', newsDetails.is_active)
        const response = await newsService.updateNews(newsUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('news.form.alert.newsSuccessfullyUpdated')}.`)
            navigateTo('/news')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>