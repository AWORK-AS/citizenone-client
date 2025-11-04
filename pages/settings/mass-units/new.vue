<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('massUnits.addNewMassUnit') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('massUnits.addNewMassUnit') }}</template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/settings/mass-units">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>
            <LoadingSpinner :isActive="state.isPageLoading">
                <ModulesUserMassUnitForm formType="create" :selectedUnit="state.formUnit" :error="state.error"
                    @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="saveUnit" />
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { massUnitService } from '@/components/api/user/MassUnitService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const breadcrumbLinks = [
    {
        name: 'massUnits.massUnits',
        translate: true,
        href: '/settings/mass-units',
    },
    {
        name: 'massUnits.addNewMassUnit',
        translate: true,
        href: '/settings/mass-units/new',
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
        const response = await massUnitService.saveMassUnit(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('massUnits.form.alert.newMassUnitSuccessfullySaved')}.`)
            navigateTo('/settings/mass-units')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>