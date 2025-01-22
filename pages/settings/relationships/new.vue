<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('relationships.addNewRelationship') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('relationships.addNewRelationship') }}</template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                to="/settings/relationships">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>
            <LoadingSpinner :isActive="state.isPageLoading">
                <ModulesRelationshipForm formType="create" :selectedRelationship="state.formRelationship"
                    :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                    @submitForm="saveRelationship" />
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { relationshipService } from '@/components/api/RelationshipService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formRelationship: {
        name: '',
    },
    isPageLoading: false,
})

async function saveRelationship(relationshipDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: relationshipDetails.name,
        }
        const response = await relationshipService.saveRelationship(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('relationships.form.alert.newRelationshipSuccessfullySaved')}.`)
            navigateTo('/settings/relationships')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>