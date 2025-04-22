<template>
    <div>
        <NuxtLayout>

            <Head>
                <Title>FMK - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <LoadingSpinner :isActive="state.isPageLoading">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <div>
                    {{ state.response }}
                </div>
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { fMKService } from '@/components/api/user/FMKService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const token = router?.currentRoute?.value?.query?.token

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    response: '',
})

onMounted(() => {
    fetchFMK()
})

async function fetchFMK() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            token: token
        }
        await fMKService.getFMK(params)
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>