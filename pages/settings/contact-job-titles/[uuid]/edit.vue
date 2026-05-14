<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('contactJobTitles.editContactJobTitle') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('contactJobTitles.editContactJobTitle') }}</template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                to="/settings/contact-job-titles">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>
            <LoadingSpinner :isActive="state.isPageLoading">
                <ModulesUserCitizenContactJobTitleForm formType="update"
                    :selectedContactJobTitle="state.formContactJobTitle" :error="state.error"
                    @isPageLoading="(value: boolean) => state.isPageLoading = value"
                    @submitForm="updateContactJobTitle" />
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { contactJobTitlesService } from '@/components/api/user/ContactJobTitlesService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const contactJobTitleUuid = router?.currentRoute?.value?.params?.uuid
const breadcrumbLinks = [
    {
        name: 'contactJobTitles.contactJobTitles',
        translate: true,
        href: '/settings/contact-job-titles',
    },
    {
        name: 'contactJobTitles.editContactJobTitle',
        translate: true,
        href: `/settings/contact-job-titles/${contactJobTitleUuid}/edit`,
    },
]

const state = reactive({
    error: {} as Error,
    formContactJobTitle: {
        en_title: '',
        dk_title: '',
        no_title: '',
        sv_title: '',
    },
    isPageLoading: false,
})

onMounted(() => {
    fetchShift()
})

async function fetchShift() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await contactJobTitlesService.getContactJobTitle(contactJobTitleUuid)
        if (response) {
            state.formContactJobTitle = {
                en_title: response?.data?.en_title ?? '',
                dk_title: response?.data?.dk_title ?? '',
                no_title: response?.data?.no_title ?? '',
                sv_title: response?.data?.sv_title ?? '',
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateContactJobTitle(contactJobTitleDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            en_title: contactJobTitleDetails.en_title,
            dk_title: contactJobTitleDetails.dk_title,
            no_title: contactJobTitleDetails.no_title,
            sv_title: contactJobTitleDetails.sv_title,
        }
        const response = await contactJobTitlesService.updateContactJobTitle(contactJobTitleUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('contactJobTitles.form.alert.contactJobTitleSuccessfullyUpdated')}.`)
            navigateTo('/settings/contact-job-titles')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>