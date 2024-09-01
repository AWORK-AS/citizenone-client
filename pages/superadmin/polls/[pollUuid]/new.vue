<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.polls.newPollItem') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.polls.newPollItem') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    :to="`/superadmin/polls/${pollUuid}`">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesSuperadminPollItemForm formType="create" :selectedPollItem="state.formPollItem"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="savePollItem" />
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

const state = reactive({
    error: {} as Error,
    formPollItem: {
        title: '',
        description: '',
        sender: '',
        region: '',
        is_active: false,
    },
    isPageLoading: false,
})

async function savePollItem(pollItemDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            'poll_uuid': pollUuid,
            'title': pollItemDetails.title,
            'description': pollItemDetails.description,
            'sender_id': pollItemDetails.sender,
            'region_id': pollItemDetails.region,
            'is_active': pollItemDetails.is_active,
        }
        const response = await pollItemService.savePollItem(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('superadmin.polls.form.alert.newPollItemSuccessfullySaved')}.`)
            navigateTo(`/superadmin/polls/${pollUuid}`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>