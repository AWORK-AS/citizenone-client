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
            <div class="space-y-1 flex flex-col items-center" v-if="$route.name === 'citizens-uuid-medicine-journals'">
                <div class="w-fit flex items-center gap-x-2 cursor-pointer text-sm text-primary hover:text-primary-700"
                    @click=downloadQRCode>
                    <Icon name="ph:download" class="h-4 w-4" aria-hidden="true" />
                    {{ $t('citizens.medicineJournals.download') }}
                </div>
                <div class="bg-white rounded-md p-2">
                    <div id="qrCode" class="flex flex-col items-center justify-center">
                        <QRCodeVue3 :value="qrValue" width="110" height="110" image="/img/logo.svg"
                            :qrOptions="{ typeNumber: 0, mode: 'Byte', errorCorrectionLevel: 'H' }"
                            :imageOptions="{ hideBackgroundDots: true, imageSize: 10, margin: 2 }"
                            :dotsOptions="{ type: 'classy', color: '#205E77' }"
                            :cornersSquareOptions="{ type: 'extra-rounded', color: '#41ADD8' }"
                            :cornersDotOptions="{ type: 'square', color: '#205E77' }"
                            :downloadOptions="{ name: `${state.selectedCitizen?.data?.firstname}-${state.selectedCitizen?.data?.lastname}-${citizenUuid}`, extension: 'png' }" />
                        <!-- <img src="/img/logo.svg" class="w-24 mt-1" /> -->
                        <p class="text-center text-primary text-xs py-1">
                            {{ state.selectedCitizen?.data?.firstname }}
                            {{ state.selectedCitizen?.data?.lastname }}
                        </p>
                    </div>
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
    const firstName = state.selectedCitizen?.data?.firstname || ''
    const lastName = state.selectedCitizen?.data?.lastname || ''
    const citizenUuid = state.selectedCitizen?.data?.uuid || ''

    if (qrCodeElement) {
        const scaleFactor = 3  // Scale factor for HD (e.g., 3x resolution)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d') as any

        // Set canvas dimensions with the scale factor
        const qrWidth = qrCodeElement.width * scaleFactor
        const qrHeight = qrCodeElement.height * scaleFactor
        const textPadding = 10 * scaleFactor
        const fontSize = 12 * scaleFactor
        const textHeight = fontSize + textPadding

        canvas.width = qrWidth
        canvas.height = qrHeight + textHeight

        // Draw the QR code onto the canvas with scaling
        ctx.drawImage(qrCodeElement, 0, 0, qrWidth, qrHeight)

        // Set font style for the text with scaling
        ctx.font = `${fontSize}px Arial`
        ctx.fillStyle = '#205E77' // Same color as the QR code for consistency
        ctx.textAlign = 'center'

        // Draw the text below the QR code with scaling
        const text = `${firstName} ${lastName}`
        ctx.fillText(text, qrWidth / 2, qrHeight + textPadding + fontSize / 2)

        // Create a link to download the canvas as an image
        const link = document.createElement('a')
        link.href = canvas.toDataURL('image/png')
        link.download = `${firstName}-${lastName}-${citizenUuid}.png`
        link.click()
    }
}


</script>