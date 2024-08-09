<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <div class="md:flex md:items-center md:justify-between md:space-x-5">
            <div class="flex items-start space-x-5">
                <div class="flex-shrink-0">
                    <div class="relative">
                        <img :src="state.selectedCitizen?.data?.image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${state.selectedCitizen?.data?.firstname + ' ' + state.selectedCitizen?.data?.lastname}`"
                            class="rounded-full w-16 h-16" />
                        <span class="absolute inset-0 rounded-full shadow-inner" aria-hidden="true" />
                    </div>
                </div>
                <div class="pt-1.5 space-y-1">
                    <h1 class="text-2xl font-bold text-gray-900">
                        {{ state.selectedCitizen?.data?.firstname }}
                        {{ state.selectedCitizen?.data?.lastname }}
                    </h1>
                    <p class="text-sm font-medium text-gray-700">
                        {{ state.selectedCitizen?.data?.email }}
                    </p>
                    <p class="text-sm font-medium text-gray-700">
                        {{ state.selectedCitizen?.data?.phone }}
                    </p>
                    <p class="text-xs font-medium text-gray-700">
                        {{ state.selectedCitizen?.data?.diagnosis }}
                    </p>
                </div>
            </div>
            <div class="bg-white rounded-md p-1 flex flex-col items-center justify-center">
                <div id="qrCode">
                    <QRCodeVue3 :value="qrValue" width="200" height="200"
                        :dotsOptions="{ type: 'classy', color: '#205E77' }"
                        :cornersSquareOptions="{ type: 'extra-rounded', color: '#41ADD8' }"
                        :cornersDotOptions="{ type: 'square', color: '#205E77' }"
                        :downloadOptions="{ name: `${state.selectedCitizen?.data?.firstname}-${state.selectedCitizen?.data?.lastname}-${citizenUuid}`, extension: 'png' }" />
                </div>
                <div class="w-fit cursor-pointer text-primary hover:text-primary-700" @click=downloadQRCode>
                    {{ $t('citizens.medicineJournals.download') }}
                </div>
            </div>
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import QRCodeVue3 from "qrcode-vue3"
import { citizenService } from '@/components/api/CitizenService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const qrValue = `${runtimeConfig.public.appBaseURL}/citizens/${citizenUuid}/medicine-journals`

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    selectedCitizen: [] as any,
})

onMounted(() => {
    fetchCitizen()
})

async function fetchCitizen() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await citizenService.getCitizen(citizenUuid)
        if (response) {
            state.selectedCitizen = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

const downloadQRCode = () => {
    const qrCodeElement = document.querySelector('#qrCode img') as HTMLImageElement

    if (qrCodeElement) {
        const link = document.createElement('a')
        link.href = qrCodeElement.src
        link.download = `${state.selectedCitizen?.data?.firstname}-${state.selectedCitizen?.data?.lastname}-${citizenUuid}.png`
        link.click()
    }
};
</script>