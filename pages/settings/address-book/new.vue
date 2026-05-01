<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('addressBook.newContact') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('addressBook.newContact') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/settings/address-book">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserSettingsAddressBookForm
                        formType="create"
                        :selectedContact="state.formContact"
                        :error="state.error"
                        @closeModal="navigateTo('/settings/address-book')"
                        @submitForm="saveContact"
                    />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { companyContactService } from '@/components/api/user/CompanyContactService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()

const breadcrumbLinks = [
    {
        name: 'addressBook.addressBook',
        translate: true,
        href: '/settings/address-book',
    },
    {
        name: 'addressBook.newContact',
        translate: true,
        href: '/settings/address-book/new',
    },
]

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formContact: {
        contact_job_title_uuid: '',
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        street: '',
        post_code: '',
        company_name: '',
        region_uuid: '',
        municipality_uuid: '',
        city_uuid: '',
    },
})

async function saveContact(formData: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await companyContactService.saveContact(formData)
        if (response) {
            successAlert(`${t('alert.success')}!`, `${t('addressBook.alert.contactSuccessfullySaved')}.`)
            navigateTo('/settings/address-book')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
