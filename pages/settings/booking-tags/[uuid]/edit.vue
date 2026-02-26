<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('bookingTags.editBookingTag') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('bookingTags.editBookingTag') }}</template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/settings/booking-tags">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>
            <LoadingSpinner :isActive="state.isPageLoading">
                <ModulesUserBookingTagForm formType="update" :selectedTag="state.formBookingTag" :error="state.error"
                    @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="updateBookingTag" />
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { bookingTagService } from '@/components/api/user/BookingTagService'
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
        name: 'bookingTags.bookingTags',
        translate: true,
        href: '/settings/booking-tags',
    },
    {
        name: 'bookingTags.editBookingTag',
        translate: true,
        href: `/settings/booking-tags/${bookingTagUuid}/edit`,
    },
]

const state = reactive({
    error: {} as Error,
    formBookingTag: {
        name: '',
        departments: [],
    } as any,
    isPageLoading: false,
})

onMounted(() => {
    fetchBookingTag()
})

async function fetchBookingTag() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await bookingTagService.getBookingTag(bookingTagUuid)
        if (response) {
            state.formBookingTag = {
                name: response?.data?.tag ?? '',
                departments: [],
            }
            response?.data?.departments?.forEach((department: any) => {
                state.formBookingTag.departments.push(department?.uuid)
            })
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateBookingTag(tagDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            tag: tagDetails.name,
            departments_uuid: tagDetails.departments,
        }
        const response = await bookingTagService.updateBookingTag(bookingTagUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('bookingTags.form.alert.bookingTagSuccessfullyUpdated')}.`)
            navigateTo('/settings/booking-tags')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>