<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('tasks.newTask') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('tasks.newTask') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    :to="`/procedures/${procedureUuid}`">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesProcedureTaskForm formType="create" :selectedProcedure="state.formProcedureTask"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="saveProcedureTask" />
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
const router = useRouter()
const procedureUuid = router?.currentRoute?.value?.params?.procedure_uuid
const { successAlert } = useAlert()
const { t } = useI18n()
const breadcrumbLinks = [
    {
        name: 'procedures.procedures',
        translate: true,
        href: '/procedures',
    },
    {
        name: 'tasks.tasks',
        translate: true,
        href: `/procedures/${procedureUuid}`,
    },
    {
        name: 'tasks.newTask',
        translate: true,
        href: `/procedures/${procedureUuid}/new`,
    },
]

const state = reactive({
    error: {} as Error,
    formProcedureTask: {
        title: '',
        content: '',
        is_active: true,
    },
    isPageLoading: false,
})

async function saveProcedureTask(procedureDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            procedure_uuid: procedureUuid,
            title: procedureDetails.title,
            content: procedureDetails.content,
            is_active: procedureDetails.is_active,
        }
        const response = await procedureTaskService.saveProcedureTask(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('tasks.form.alert.newTaskSuccessfullySaved')}.`)
            navigateTo(`/procedures/${procedureUuid}`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>