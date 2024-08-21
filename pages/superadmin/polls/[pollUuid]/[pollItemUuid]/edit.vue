<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.polls.editPollItem') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.polls.editPollItem') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    :to="`/superadmin/polls/${pollUuid}`">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesSuperadminPollItemForm formType="update" :selectedPollItem="state.formPollItem"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="updatePollItem" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { pollItemService } from '@/components/api/superadmin/PollItemService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const pollUuid = router?.currentRoute?.value?.params?.pollUuid
const pollItemUuid = router?.currentRoute?.value?.params?.pollItemUuid

const state = reactive({
    error: {} as Error,
    formPollItem: {
        title: '',
        description: '',
        is_active: false,
    },
    isPageLoading: false,
})

onMounted(() => {
    fetchPollItem()
})

async function fetchPollItem() {
    state.isPageLoading = true
    state.error = {}
    try {
        const response = await pollItemService.getPollItem(pollItemUuid)
        if (response) {
            state.formPollItem = {
                title: response?.data?.title ?? '',
                description: response?.data?.description ?? '',
                is_active: response?.data?.is_active ? true : false,
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updatePollItem(pollItemDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            'title': pollItemDetails.title,
            'description': pollItemDetails.description,
            'is_active': pollItemDetails.is_active,
        }
        const response = await pollItemService.updatePollItem(pollItemUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('superadmin.polls.form.alert.pollItemSuccessfullyUpdated')}.`)
            navigateTo(`/superadmin/polls/${pollUuid}`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>