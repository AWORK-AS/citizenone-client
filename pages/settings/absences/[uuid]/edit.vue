<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('absences.editAbsence') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('absences.editAbsence') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/settings/absences">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesAbsenceForm formType="update" :selectedAbsence="state.formAbsence" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="updateAbsence" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { absenceService } from '@/components/api/AbsenceService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const absenceUuid = router?.currentRoute?.value?.params?.uuid

const breadcrumbLinks = [
    {
        name: 'absences.absences',
        translate: true,
        href: '/settings/absences',
    },
    {
        name: 'absences.editAbsence',
        translate: true,
        href: `/settings/absences/${absenceUuid}/edit`,
    },
]

const state = reactive({
    error: {} as Error,
    formAbsence: {
        name: '',
    },
    isPageLoading: false,
})

onMounted(() => {
    fetchAbsence()
})

async function fetchAbsence() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await absenceService.getAbsence(absenceUuid)
        if (response) {
            state.formAbsence = {
                name: response?.data?.name ?? '',
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateAbsence(absenceDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: absenceDetails.name,
        }
        const response = await absenceService.updateAbsence(absenceUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('absences.form.alert.absenceSuccessfullyUpdated')}.`)
            navigateTo('/settings/absences')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>