<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('calendarTags.addNewCalendarTag') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('calendarTags.addNewCalendarTag') }}</template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                to="/settings/calendar-tags">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>
            <LoadingSpinner :isActive="state.isPageLoading">
                <ModulesUserCalendarTagForm formType="create" :selectedCalendarTag="state.formCalendarTag"
                    :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                    @submitForm="saveCalendarTag" />
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
const breadcrumbLinks = [
    {
        name: 'calendarTags.calendarTags',
        translate: true,
        href: '/settings/calendar-tags',
    },
    {
        name: 'calendarTags.addNewCalendarTag',
        translate: true,
        href: '/settings/calendar-tags/new',
    },
]

const state = reactive({
    error: {} as Error,
    formCalendarTag: {
        name: '',
        departments: [],
        color: '#000000',
    },
    isPageLoading: false,
})

async function saveCalendarTag(tagDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            tag: tagDetails.name,
            departments_uuid: tagDetails.departments,
            color: tagDetails.color,
        }
        const response = await calendarTagService.saveCalendarTag(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('calendarTags.form.alert.newCalendarTagSuccessfullySaved')}.`)
            navigateTo('/settings/calendar-tags')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>