<template>

    <Head>
        <Title>Admin consent - {{ runtimeConfig?.public?.appName }}</Title>
    </Head>

    <LoadingSpinner :isActive="state.isPageLoading">
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <div class="flex h-screen flex-1">
            <div class="relative hidden w-0 flex-1 lg:block overflow-clip">
                <img src="https://citizenone.dk/wp-content/uploads/2024/09/CitizenOne-6.jpg" alt="Image failed to load"
                    class="absolute inset-0 h-full w-full object-cover" />
                <img src="https://citizenone.dk/wp-content/uploads/2025/03/citizenone-journalsystem.svg"
                    alt="Image failed to load" class="absolute w-1/2" style="top: -16%; left: -11%;" />
                <div>
                    <img src="/img/icons/asset-01.svg" alt="Image failed to load"
                        class="absolute w-2/4 -bottom-56 -right-12" />
                    <p class="absolute bottom-10 right-10 text-lg text-white flex items-center gap-x-2">
                        <img src="/img/icons/shield.svg" alt="Image failed to load" class="w-8 h-8" />
                        ISO-certificeret serverlagring beliggende i EU
                    </p>
                </div>
            </div>
        </div>
    </LoadingSpinner>

</template>

<script setup lang="ts">
import { adminConsentService } from '@/components/api/user/AdminConsentService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
})

onMounted(() => {
    loadAdminConsentCallback()
})

async function loadAdminConsentCallback() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {}
        await adminConsentService.callback(params)
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>