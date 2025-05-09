<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('units.addNewUnit') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('units.addNewUnit') }}</template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/settings/units">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>
            <LoadingSpinner :isActive="state.isPageLoading">
                <ModulesUserUnitForm formType="create" :selectedUnit="state.formUnit" :error="state.error"
                    @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="saveUnit" />
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { unitService } from '@/components/api/user/UnitService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const breadcrumbLinks = [
    {
        name: 'units.units',
        translate: true,
        href: '/settings/units',
    },
    {
        name: 'units.addNewUnit',
        translate: true,
        href: '/settings/units/new',
    },
]

const state = reactive({
    error: {} as Error,
    formUnit: {
        name: '',
    },
    isPageLoading: false,
})

async function saveUnit(unitDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: unitDetails.name,
        }
        const response = await unitService.saveUnit(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('units.form.alert.newUnitSuccessfullySaved')}.`)
            navigateTo('/settings/units')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>