<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('foreignCities.newForeignCity') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('foreignCities.newForeignCity') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/settings/foreign-cities">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserForeignCityForm formType="create" :selectedForeignCity="state.formForeignCity"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="saveForeignCity" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { foreignCityService } from '@/components/api/user/ForeignCityService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const breadcrumbLinks = [
    {
        name: 'foreignCities.foreignCities',
        translate: true,
        href: '/settings/foreign-cities',
    },
    {
        name: 'foreignCities.newForeignCity',
        translate: true,
        href: '/settings/foreign-cities/new',
    },
]

const state = reactive({
    error: {} as Error,
    formForeignCity: {
        name: '',
    },
    isPageLoading: false,
})

async function saveForeignCity(foreignCity: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: foreignCity.name,
        }
        const response = await foreignCityService.saveForeignCity(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('foreignCities.form.alert.newForeignCitySuccessfullySaved')}.`)
            navigateTo('/settings/foreign-cities')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>