<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('sections.addNewSection') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('sections.addNewSection') }}</template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/settings/sections">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>
            <LoadingSpinner :isActive="state.isPageLoading">
                <ModulesUserSectionForm formType="create" :selectedSection="state.formSection" :error="state.error"
                    @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="saveSection" />
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { sectionService } from '@/components/api/user/SectionService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const breadcrumbLinks = [
    {
        name: 'sections.sections',
        translate: true,
        href: '/settings/sections',
    },
    {
        name: 'sections.addNewSection',
        translate: true,
        href: '/settings/sections/new',
    },
]

const state = reactive({
    error: {} as Error,
    formSection: {
        name: '',
    },
    isPageLoading: false,
})

async function saveSection(sectionDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: sectionDetails.name,
        }
        const response = await sectionService.saveSection(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('sections.form.alert.newSectionSuccessfullySaved')}.`)
            navigateTo('/settings/sections')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>