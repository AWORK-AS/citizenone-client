<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('expenseCategories.newExpenseCategory') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('expenseCategories.newExpenseCategory') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/settings/expense-categories">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserExpenseCategoryForm formType="create" :selectedExpenseCategory="state.formExpenseCategory" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="saveExpenseCategory" />
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
const breadcrumbLinks = [
    {
        name: 'expenseCategories.expenseCategories',
        translate: true,
        href: '/settings/expense-categories',
    },
    {
        name: 'expenseCategories.newExpenseCategory',
        translate: true,
        href: '/settings/expense-categories/new',
    },
]

const state = reactive({
    error: {} as Error,
    formExpenseCategory: {
        name: '',
    },
    isPageLoading: false,
})

async function saveExpenseCategory(expenseCategoryDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: expenseCategoryDetails.name,
        }
        const response = await expenseCategoryService.saveExpenseCategory(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('expenseCategories.form.alert.newExpenseCategorySuccessfullySaved')}.`)
            navigateTo('/settings/expense-categories')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>