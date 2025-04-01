<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('foreignCities.editForeignCity') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('foreignCities.editForeignCity') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/settings/foreign-cities">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserForeignCityForm formType="update" :selectedForeignCity="state.formForeignCity"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="updateForeignCity" />
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
const router = useRouter()
const foreignCityUuid = router?.currentRoute?.value?.params?.uuid
const breadcrumbLinks = [
    {
        name: 'foreignCities.foreignCities',
        translate: true,
        href: '/settings/foreign-cities',
    },
    {
        name: 'foreignCities.editForeignCity',
        translate: true,
        href: `/settings/foreign-cities/${foreignCityUuid}/edit`,
    },
]

const state = reactive({
    error: {} as Error,
    formForeignCity: {
        name: '',
    },
    isPageLoading: false,
})

onMounted(() => {
    fetchForeignCity()
})

async function fetchForeignCity() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await foreignCityService.getForeignCity(foreignCityUuid)
        if (response) {
            state.formForeignCity = {
                name: response?.data?.name ?? '',
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateForeignCity(foreignCityDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: foreignCityDetails.name,
        }
        const response = await foreignCityService.updateForeignCity(foreignCityUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('foreignCities.form.alert.foreignCitySuccessfullyUpdated')}.`)
            navigateTo('/settings/foreign-cities')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>