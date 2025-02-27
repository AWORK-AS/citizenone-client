<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('relationships.editRelationship') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('relationships.editRelationship') }}</template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                to="/settings/relationships">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>
            <LoadingSpinner :isActive="state.isPageLoading">
                <ModulesUserRelationshipForm formType="update" :selectedRelationship="state.formRelationship"
                    :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                    @submitForm="updateRelationship" />
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { relationshipService } from '@/components/api/user/RelationshipService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const relationshipUuid = router?.currentRoute?.value?.params?.uuid
const breadcrumbLinks = [
    {
        name: 'relationships.relationships',
        translate: true,
        href: '/settings/relationships',
    },
    {
        name: 'relationships.editRelationship',
        translate: true,
        href: `/settings/relationships/${relationshipUuid}/edit`,
    },
]

const state = reactive({
    error: {} as Error,
    formRelationship: {
        name: '',
    },
    isPageLoading: false,
})

onMounted(() => {
    fetchRelationship()
})

async function fetchRelationship() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await relationshipService.getRelationship(relationshipUuid)
        if (response) {
            state.formRelationship = {
                name: response?.data?.name ?? '',
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateRelationship(relationshipDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: relationshipDetails.name,
        }
        const response = await relationshipService.updateRelationship(relationshipUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('relationships.form.alert.relationshipSuccessfullyUpdated')}.`)
            navigateTo('/settings/relationships')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>