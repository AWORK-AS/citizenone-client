<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('procedures.newProcedure') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('procedures.newProcedure') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/procedures">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserProcedureForm formType="create" :selectedProcedure="state.formProcedure"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="saveProcedure" />
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
const breadcrumbLinks = [
    {
        name: 'procedures.procedures',
        translate: true,
        href: '/procedures',
    },
    {
        name: 'procedures.newProcedure',
        translate: true,
        href: '/procedures/new',
    },
]

const state = reactive({
    error: {} as Error,
    formProcedure: {
        title: '',
        content: '',
        is_active: true,
    },
    isPageLoading: false,
})

async function saveProcedure(procedureDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            title: procedureDetails.title,
            content: procedureDetails.content,
            is_active: procedureDetails.is_active,
        }
        const response = await procedureService.saveProcedure(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('procedures.form.alert.newProcedureSuccessfullySaved')}.`)
            navigateTo('/procedures')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>