<template>
    <div>
        <NuxtLayout name="referrer">

            <Head>
                <Title>{{ $t('referrer.shareLink') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <BreadcrumbReferrer :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('referrer.shareLink') }}</template>

            <div class="space-y-5">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <div v-if="state.isLoading" class="flex justify-center py-10">
                    <Icon name="ph:spinner" class="h-8 w-8 animate-spin text-primary" />
                </div>

                <div v-else-if="state.shareLink" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-2xl">
                    <div class="flex items-center gap-x-3 mb-4">
                        <Icon
                            :name="state.shareLink.is_valid ? 'heroicons:check-circle' : 'heroicons:x-circle'"
                            :class="state.shareLink.is_valid ? 'text-green-500' : 'text-red-500'"
                            class="h-8 w-8" />
                        <p class="text-lg font-medium text-gray-900">
                            {{ state.shareLink.is_valid ? $t('referrer.shareLinkValid') : $t('referrer.shareLinkInvalid') }}
                        </p>
                    </div>
                    <dl class="divide-y divide-gray-100" v-if="state.shareLink.is_valid">
                        <div class="py-3 grid grid-cols-3 gap-4" v-if="state.shareLink.expires_at">
                            <dt class="text-sm font-medium text-gray-500">{{ $t('referrer.expiresAt') }}</dt>
                            <dd class="text-sm text-gray-900 col-span-2">{{ state.shareLink.expires_at }}</dd>
                        </div>
                    </dl>
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { shareLinkService } from '@/components/api/referrer/ShareLinkService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()

const breadcrumbLinks = [
    { name: 'referrer.shareLink', href: '', translate: true },
]

const state = reactive({
    error: {} as Error,
    isLoading: false,
    shareLink: null as any,
})

onMounted(() => {
    fetchShareLink()
})

async function fetchShareLink() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await shareLinkService.getShareLink(route.params.uuid as string)
        if (response?.data) {
            state.shareLink = response.data
        }
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}
</script>
