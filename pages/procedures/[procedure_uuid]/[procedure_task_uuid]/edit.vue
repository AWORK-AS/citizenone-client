<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('tasks.editTask') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('tasks.editTask') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    :to="`/procedures/${procedureUuid}`">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesProcedureTaskForm formType="update" :selectedProcedureTask="state.formProcedureTask"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="updateProcedureTask" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { procedureTaskService } from '@/components/api/ProcedureTaskService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const procedureUuid = router?.currentRoute?.value?.params?.procedure_uuid
const procedureTaskUuid = router?.currentRoute?.value?.params?.procedure_task_uuid

const state = reactive({
    error: {} as Error,
    formProcedureTask: {
        title: '',
        content: '',
        is_active: false,
    },
    isPageLoading: false,
})

onMounted(() => {
    fetchProcedureTask()
})

async function fetchProcedureTask() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await procedureTaskService.getProcedureTask(procedureTaskUuid)
        if (response) {
            state.formProcedureTask = {
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

async function updateProcedureTask(procedureDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            title: procedureDetails.title,
            content: procedureDetails.content,
            is_active: procedureDetails.is_active,
        }
        const response = await procedureTaskService.updateProcedureTask(procedureTaskUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('tasks.form.alert.taskSuccessfullyUpdated')}.`)
            navigateTo(`/procedures/${procedureUuid}`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>