<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('customPages.editCustomPage') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('customPages.editCustomPage') }}</template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                to="/settings/custom-pages">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>
            <LoadingSpinner :isActive="state.isPageLoading">
                <ModulesCustomPagesForm formType="update" :selectedCustomPage="state.formCustomPage"
                    :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                    @submitForm="updateCustomPage" />
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { customPagesService } from '@/components/api/CustomPagesService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const customPageUuid = router?.currentRoute?.value?.params?.uuid
const state = reactive({
    error: {} as Error,
    formCustomPage: {
        name: '',
        page_type:''
    },
    isPageLoading: false,
})

onMounted(() => {
    fetchJournalNoteTag()
})

async function fetchJournalNoteTag() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await customPagesService.getCustomPage(customPageUuid)
        if (response) {
            state.formCustomPage = {
                name: response?.data?.custom_name ?? '',
                page_type: response?.data?.page_type ?? ''
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateCustomPage(customPageDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            custom_name: customPageDetails.name
        }
        const response = await customPagesService.updateCustomPage(customPageUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('customPages.form.alert.customPageSuccessfullyUpdated')}.`)
            navigateTo('/settings/custom-pages')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>