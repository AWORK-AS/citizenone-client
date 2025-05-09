<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('units.editUnit') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('units.editUnit') }}</template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/settings/units">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>
            <LoadingSpinner :isActive="state.isPageLoading">
                <ModulesUserUnitForm formType="update" :selectedUnit="state.formUnit" :error="state.error"
                    @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="updateUnit" />
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
const router = useRouter()
const unitUuid = router?.currentRoute?.value?.params?.uuid
const breadcrumbLinks = [
    {
        name: 'units.units',
        translate: true,
        href: '/settings/units',
    },
    {
        name: 'units.editUnit',
        translate: true,
        href: `/settings/units/${unitUuid}/edit`,
    },
]

const state = reactive({
    error: {} as Error,
    formUnit: {
        name: '',
    },
    isPageLoading: false,
})

onMounted(() => {
    fetchUnit()
})

async function fetchUnit() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await unitService.getUnit(unitUuid)
        if (response) {
            state.formUnit = {
                name: response?.data?.name ?? '',
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateUnit(unitDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: unitDetails.name,
        }
        const response = await unitService.updateUnit(unitUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('units.form.alert.unitSuccessfullyUpdated')}.`)
            navigateTo('/settings/units')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>