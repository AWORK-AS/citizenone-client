<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('departments.editDepartment') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('departments.editDepartment') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/departments">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesDepartmentForm formType="update" :selectedDepartment="state.formDepartment"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="updateDepartment" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { departmentService } from '@/components/api/DepartmentService'
import { useI18n } from "vue-i18n"
import { notify } from "@kyvg/vue3-notification"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()
const router = useRouter()
const departmentUuid = router?.currentRoute?.value?.params?.uuid

const state = reactive({
    error: {} as Error,
    formDepartment: {
        name: '',
    },
    isPageLoading: false,
})

onMounted(() => {
    fetchDepartment()
})

async function fetchDepartment() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await departmentService.getDepartment(departmentUuid)
        if (response) {
            state.formDepartment = {
                name: response?.data?.name ?? '',
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateDepartment(departmentDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: departmentDetails.name,
        }
        const response = await departmentService.updateDepartment(departmentUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('departments.form.alert.departmentSuccessfullyUpdated')}.`)
            navigateTo('/departments')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function successAlert(title: string, message: string) {
    notify({
        title: title,
        text: message,
        type: 'success',
    })
}
</script>