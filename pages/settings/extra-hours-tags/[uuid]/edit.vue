<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('extraHoursTags.editExtraHoursTag') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('extraHoursTags.editExtraHoursTag') }}</template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                to="/settings/extra-hours-tags">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>
            <LoadingSpinner :isActive="state.isPageLoading">
                <ModulesUserExtraHoursTagForm formType="update" :selectedTag="state.formExtraHoursTag"
                    :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                    @submitForm="updateExtraHoursTag" />
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { extraHoursTagService } from '@/components/api/user/ExtraHoursTagService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const bookingTagUuid = router?.currentRoute?.value?.params?.uuid
const breadcrumbLinks = [
    {
        name: 'extraHoursTags.extraHoursTags',
        translate: true,
        href: '/settings/extra-hours-tags',
    },
    {
        name: 'extraHoursTags.editExtraHoursTag',
        translate: true,
        href: `/settings/extra-hours-tags/${bookingTagUuid}/edit`,
    },
]

const state = reactive({
    error: {} as Error,
    formExtraHoursTag: {
        name: '',
        departments: [],
    } as any,
    isPageLoading: false,
})

onMounted(() => {
    fetchExtraHoursTag()
})

async function fetchExtraHoursTag() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await extraHoursTagService.getExtraHoursTag(bookingTagUuid)
        if (response) {
            state.formExtraHoursTag = {
                name: response?.data?.tag ?? '',
                departments: [],
            }
            response?.data?.departments?.forEach((department: any) => {
                state.formExtraHoursTag.departments.push(department?.uuid)
            })
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateExtraHoursTag(tagDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            tag: tagDetails.name,
            departments_uuid: tagDetails.departments,
        }
        const response = await extraHoursTagService.updateExtraHoursTag(bookingTagUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('extraHoursTags.form.alert.extraHoursTagSuccessfullyUpdated')}.`)
            navigateTo('/settings/extra-hours-tags')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>