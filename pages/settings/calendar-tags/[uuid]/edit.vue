<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('calendarTags.editCalendarTag') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('calendarTags.editCalendarTag') }}</template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                to="/settings/calendar-tags">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>
            <LoadingSpinner :isActive="state.isPageLoading">
                <ModulesUserCalendarTagForm formType="update" :selectedTag="state.formCalendarTag" :error="state.error"
                    @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="updateCalendarTag" />
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { calendarTagService } from '@/components/api/user/CalendarTagService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const calendarTagUuid = router?.currentRoute?.value?.params?.uuid
const breadcrumbLinks = [
    {
        name: 'calendarTags.calendarTags',
        translate: true,
        href: '/settings/calendar-tags',
    },
    {
        name: 'calendarTags.editCalendarTag',
        translate: true,
        href: `/settings/calendar-tags/${calendarTagUuid}/edit`,
    },
]

const state = reactive({
    error: {} as Error,
    formCalendarTag: {
        name: '',
        departments: [],
        color: '#000000',
    } as any,
    isPageLoading: false,
})

onMounted(() => {
    fetchCalendarTag()
})

async function fetchCalendarTag() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await calendarTagService.getCalendarTag(calendarTagUuid)
        if (response) {
            state.formCalendarTag = {
                name: response?.data?.tag ?? '',
                departments: [],
                color: response?.data?.color ?? '',
            }
            response?.data?.departments?.forEach((department: any) => {
                state.formCalendarTag.departments.push(department?.uuid)
            })
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateCalendarTag(tagDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            tag: tagDetails.name,
            departments_uuid: tagDetails.departments,
            color: tagDetails.color,
        }
        const response = await calendarTagService.updateCalendarTag(calendarTagUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('calendarTags.form.alert.calendarTagSuccessfullyUpdated')}.`)
            navigateTo('/settings/calendar-tags')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>