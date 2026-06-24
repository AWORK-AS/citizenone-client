<template>
    <div>
        <NuxtLayout>

            <Head>
                <Title>FMK - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <LoadingSpinner :isActive="state.isPageLoading">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <pre>{{ state.response }}</pre>
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
// Standalone debug page for the FMK integration. Real placement — showing a
// citizen's medicine card within the citizen's own context — is a separate UX
// task. This page just exercises the backend endpoint with orgCvr + cpr from
// the URL query (e.g. /fmk?orgCvr=91023120&cpr=0102792941).
import { fMKService } from '@/components/api/user/FMKService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const query = router?.currentRoute?.value?.query ?? {}
const orgCvr = (query.orgCvr as string) ?? ''
const cpr = (query.cpr as string) ?? ''
const role = (query.role as string) || undefined

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    response: '' as any,
})

onMounted(() => {
    fetchFMK()
})

async function fetchFMK() {
    state.error = {}
    state.response = ''

    if (!orgCvr || !cpr) {
        state.error = { message: 'Mangler orgCvr og cpr i URL (fx /fmk?orgCvr=12345678&cpr=0101011234)' } as Error
        return
    }

    state.isPageLoading = true
    try {
        const result = await fMKService.getMedicineCard({ orgCvr, cpr, role })
        state.response = result?.data ?? result
    } catch (error: any) {
        // A 4202 fault (wrong ID-card type) is the currently-expected outcome
        // until the MitID Erhverv / user-IDkort login layer is built — surface
        // it gracefully rather than as a crash.
        const message = error?.data?.message || error?.message || 'FMK-kaldet fejlede'
        const faultCode = error?.data?.faultCode
        state.error = { message: faultCode ? `${message} (kode ${faultCode})` : message } as Error
    } finally {
        state.isPageLoading = false
    }
}
</script>
