<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.polls.newPoll') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.polls.newPoll') }}</template>

            <div class="p-1 max-w-2xl">
                <NuxtLink to="/superadmin/polls"
                    class="inline-flex items-center gap-1.5 text-sm text-[#5C6478] hover:text-[#1F2533] mb-6 transition-colors">
                    <Icon name="ph:arrow-left" class="w-4 h-4" />
                    {{ $t('superadmin.polls.polls') }}
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesSuperadminPollForm formType="create" :selectedPoll="state.formPoll" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="savePoll" />
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

const state = reactive({
    error: {} as Error,
    formPoll: {
        title: '',
        is_active: false,
    },
    isPageLoading: false,
})

async function savePoll(pollDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            'title': pollDetails.title,
            'is_active': pollDetails.is_active,
        }
        const response = await pollService.savePoll(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('superadmin.polls.form.alert.newPollSuccessfullySaved')}.`)
            navigateTo('/superadmin/polls')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>