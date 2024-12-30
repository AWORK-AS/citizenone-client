<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('absences.newAbsence') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('absences.newAbsence') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/settings/absences">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesAbsenceForm formType="create" :selectedAbsence="state.formAbsence" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="saveAbsence" />
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

const state = reactive({
    error: {} as Error,
    formAbsence: {
        name: '',
    },
    isPageLoading: false,
})

async function saveAbsence(absenceDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: absenceDetails.name,
        }
        const response = await absenceService.saveAbsence(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('absences.form.alert.newAbsenceSuccessfullySaved')}.`)
            navigateTo('/settings/absences')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>