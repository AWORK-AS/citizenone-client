<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('addictions.editAddiction') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('addictions.editAddiction') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/settings/addictions">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserAddictionForm formType="update" :selectedAddiction="state.formAddiction"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="updateAddiction" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { addictionService } from '@/components/api/AddictionService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const addictionUuid = router?.currentRoute?.value?.params?.uuid
const breadcrumbLinks = [
    {
        name: 'addictions.addictions',
        translate: true,
        href: '/settings/addictions',
    },
    {
        name: 'addictions.editAddiction',
        translate: true,
        href: `/settings/addictions/${addictionUuid}/edit`,
    },
]

const state = reactive({
    error: {} as Error,
    formAddiction: {
        name: '',
    },
    isPageLoading: false,
})

onMounted(() => {
    fetchAddiction()
})

async function fetchAddiction() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await addictionService.getAddiction(addictionUuid)
        if (response) {
            state.formAddiction = {
                name: response?.data?.name ?? '',
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateAddiction(addictionDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: addictionDetails.name,
        }
        const response = await addictionService.updateAddiction(addictionUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('addictions.form.alert.addictionSuccessfullyUpdated')}.`)
            navigateTo('/settings/addictions')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>