<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('addictions.newAddiction') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('addictions.newAddiction') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/settings/addictions">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesAddictionForm formType="create" :selectedAddiction="state.formAddiction"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="saveAddiction" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { addictionService } from '@/components/api/AddictionService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const breadcrumbLinks = [
    {
        name: 'addictions.addictions',
        translate: true,
        href: '/settings/addictions',
    },
    {
        name: 'addictions.newAddiction',
        translate: true,
        href: '/settings/addictions/new',
    },
]

const state = reactive({
    error: {} as Error,
    formAddiction: {
        name: '',
    },
    isPageLoading: false,
})

async function saveAddiction(addictionDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: addictionDetails.name,
        }
        const response = await addictionService.saveAddiction(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('addictions.form.alert.newAddictionSuccessfullySaved')}.`)
            navigateTo('/settings/addictions')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>