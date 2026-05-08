<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('addressBook.editContact') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('addressBook.editContact') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/settings/address-book">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserSettingsAddressBookForm
                        formType="update"
                        :selectedContact="state.formContact"
                        :error="state.error"
                        @closeModal="navigateTo('/settings/address-book')"
                        @submitForm="updateContact"
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
const router = useRouter()
const contactUuid = router?.currentRoute?.value?.params?.uuid as string

const breadcrumbLinks = [
    {
        name: 'addressBook.addressBook',
        translate: true,
        href: '/settings/address-book',
    },
    {
        name: 'addressBook.editContact',
        translate: true,
        href: `/settings/address-book/${contactUuid}/edit`,
    },
]

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formContact: {} as any,
})

onMounted(() => {
    fetchContact()
})

async function fetchContact() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await companyContactService.getContact(contactUuid)
        if (response?.data) {
            state.formContact = response.data
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateContact(formData: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await companyContactService.updateContact(contactUuid, formData)
        if (response) {
            successAlert(`${t('alert.success')}!`, `${t('addressBook.alert.contactSuccessfullyUpdated')}.`)
            navigateTo('/settings/address-book')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
