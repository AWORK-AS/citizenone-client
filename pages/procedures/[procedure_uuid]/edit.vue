<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('procedures.editProcedure') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('procedures.editProcedure') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/procedures">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesProcedureForm formType="update" :selectedProcedure="state.formProcedure"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="updateProcedure" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { procedureService } from '@/components/api/ProcedureService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const procedureUuid = router?.currentRoute?.value?.params?.procedure_uuid

const state = reactive({
    error: {} as Error,
    formProcedure: {
        title: '',
        content: '',
        is_active: false,
    },
    isPageLoading: false,
})

onMounted(() => {
    fetchProcedure()
})

async function fetchProcedure() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await procedureService.getProcedure(procedureUuid)
        if (response) {
            state.formProcedure = {
                title: response?.data?.title ?? '',
                content: response?.data?.content ?? '',
                is_active: response?.data?.is_active ?? '',
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateProcedure(procedureDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            title: procedureDetails.title,
            content: procedureDetails.content,
            is_active: procedureDetails.is_active,
        }
        const response = await procedureService.updateProcedure(procedureUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('procedures.form.alert.procedureSuccessfullyUpdated')}.`)
            navigateTo('/procedures')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>