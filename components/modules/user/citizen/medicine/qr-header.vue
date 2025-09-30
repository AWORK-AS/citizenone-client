<template>
    <div class="flex flex-col items-center gap-y-10">
        <div class="space-y-1 flex flex-col items-center">
            <div class="w-fit flex items-center gap-x-2 cursor-pointer text-sm text-primary hover:text-primary-700"
                @click=downloadQRCode>
                <Icon name="ph:download" class="h-4 w-4" aria-hidden="true" />
                {{ $t('citizens.medicineJournals.download') }}
            </div>
            <div class="bg-white rounded-md p-2">
                <div id="qrCode" class="mx-auto w-1/2 md:w-36 flex flex-col items-center justify-center">
                    <QRCodeVue3 :value="qrValue" :width="800" :height="800" image="/img/logo.svg"
                        :qrOptions="{ typeNumber: 0, mode: 'Byte', errorCorrectionLevel: 'H' }"
                        :imageOptions="{ hideBackgroundDots: true, imageSize: 10, margin: 2 }"
                        :dotsOptions="{ type: 'classy', color: '#205E77' }"
                        :cornersSquareOptions="{ type: 'extra-rounded', color: '#41ADD8' }"
                        :cornersDotOptions="{ type: 'square', color: '#205E77' }"
                        :downloadOptions="{ name: `${props.selectedCitizen?.data?.firstname}-${props.selectedCitizen?.data?.lastname}-${citizenUuid}`, extension: 'png' }" />
                    <p class="text-center text-primary text-xs py-1">
                        {{ props.selectedCitizen?.data?.firstname }}
                        {{ props.selectedCitizen?.data?.lastname }}
                    </p>
                </div>
            </div>
        </div>
        <p class="w-52 text-center text-xs text-primary hover:text-secondary-700 cursor-pointer"
            @click="state.modal.isViewRelevantHelpLinksOpen = true">
            {{
                $t('citizens.medicineJournals.relevantHelpLinksForWorkingWithMedicine.relevantHelpLinksForWorkingWithMedicine')
            }}
        </p>
        <ModulesUserCitizenMedicineModalRelevantHelpLinks :isModalOpen="state.modal.isViewRelevantHelpLinksOpen"
            @close="state.modal.isViewRelevantHelpLinksOpen = false" />
    </div>
</template>

<script setup lang="ts">
const QRCodeVue3 = defineAsyncComponent(() =>
    import('qrcode-vue3')
)

const props = defineProps({
    selectedCitizen: {
        type: Object,
        required: true,
    },
})

const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const qrValue = `${runtimeConfig.public.appBaseURL}/citizens/${citizenUuid}/medicine-journals`

const state = reactive({
    modal: {
        isViewRelevantHelpLinksOpen: false,
    },
})

const downloadQRCode = () => {
    const qrCodeElement = document.querySelector('#qrCode img') as HTMLImageElement
    const firstName = props.selectedCitizen?.data?.firstname || ''
    const lastName = props.selectedCitizen?.data?.lastname || ''
    const citizenUuid = props.selectedCitizen?.data?.uuid || ''

    if (qrCodeElement) {
        const scaleFactor = 5  // Scale factor for HD (e.g., 3x resolution)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d') as any

        // Set canvas dimensions with the scale factor
        const qrWidth = qrCodeElement.width * scaleFactor
        const qrHeight = qrCodeElement.height * scaleFactor
        const textPadding = 5 * scaleFactor
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