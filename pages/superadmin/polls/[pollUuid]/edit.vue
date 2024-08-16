<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.polls.editPoll') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.polls.editPoll') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/superadmin/polls">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesSuperadminPollForm formType="update" :selectedPoll="state.formPoll" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="updatePoll" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { pollService } from '@/components/api/superadmin/PollService'
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
    formPoll: {
        title: '',
        is_active: false,
    },
    isPageLoading: false,
})

onMounted(() => {
    fetchPoll()
})

async function fetchPoll() {
    state.isPageLoading = true
    state.error = {}
    try {
        const response = await pollService.getPoll(pollUuid)
        if (response) {
            state.formPoll = {
                title: response?.data?.title ?? '',
                is_active: response?.data?.is_active ?? '',
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updatePoll(pollDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            'title': pollDetails.title,
            'is_active': pollDetails.is_active,
        }
        const response = await pollService.updatePoll(pollUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('superadmin.polls.form.alert.pollSuccessfullyUpdated')}.`)
            navigateTo('/superadmin/polls')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>