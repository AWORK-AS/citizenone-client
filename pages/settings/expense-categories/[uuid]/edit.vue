<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('expenseCategories.editExpenseCategory') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('expenseCategories.editExpenseCategory') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/settings/expense-categories">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserExpenseCategoryForm formType="update" :selectedExpenseCategory="state.formExpenseCategory" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="updateExpenseCategory" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { expenseCategoryService } from '@/components/api/user/ExpenseCategoryService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const expenseCategoryUuid = router?.currentRoute?.value?.params?.uuid

const breadcrumbLinks = [
    {
        name: 'expenseCategories.expenseCategories',
        translate: true,
        href: '/settings/expense-categories',
    },
    {
        name: 'expenseCategories.editExpenseCategory',
        translate: true,
        href: `/settings/expense-categories/${expenseCategoryUuid}/edit`,
    },
]

const state = reactive({
    error: {} as Error,
    formExpenseCategory: {
        name: '',
    },
    isPageLoading: false,
})

onMounted(() => {
    fetchExpenseCategory()
})

async function fetchExpenseCategory() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await expenseCategoryService.getExpenseCategory(expenseCategoryUuid)
        if (response) {
            state.formExpenseCategory = {
                name: response?.data?.name ?? '',
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateExpenseCategory(expenseCategoryDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: expenseCategoryDetails.name,
        }
        const response = await expenseCategoryService.updateExpenseCategory(expenseCategoryUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('expenseCategories.form.alert.expenseCategorySuccessfullyUpdated')}.`)
            navigateTo('/settings/expense-categories')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>