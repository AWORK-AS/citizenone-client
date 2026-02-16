<template>
    <div>
        <Modal size="xl" :title="$t('plansandgoals.followUpNotifications')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isDownloading">
                    <div class="bg-white p-8 max-w-4xl mx-auto">
                        <Alert type="danger" :text="state.error" v-if="state.error" class="mb-4" />
                    <div class="text-center mb-8">
                        <svg class="inline-block" width="186" height="40" viewBox="0 0 272 41" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <g clip-path="url(#clip0_view_report)">
                                <path
                                    d="M0 19.22C0 9.7 7.29 2.82 17.08 2.82C22.27 2.82 26.74 4.69 29.7 8.15L25.87 11.75C23.55 9.25 20.68 8.02 17.35 8.02C10.75 8.02 5.96 12.67 5.96 19.23C5.96 25.79 10.74 30.43 17.35 30.43C20.67 30.43 23.54 29.2 25.87 26.65L29.7 30.29C26.74 33.75 22.28 35.62 17.04 35.62C7.29 35.62 0 28.74 0 19.22Z"
                                    fill="#00B0DB" />
                                <path
                                    d="M34.07 3.42C34.07 1.51 35.62 0 37.71 0C39.8 0 41.35 1.41 41.35 3.28C41.35 5.28 39.85 6.83 37.71 6.83C35.57 6.83 34.07 5.33 34.07 3.41V3.42ZM34.84 10.84H40.53V35.16H34.84V10.84Z"
                                    fill="#00B0DB" />
                                <path
                                    d="M62.62 33.84C61.25 34.93 59.2 35.48 57.15 35.48C51.82 35.48 48.77 32.66 48.77 27.28V15.57H44.76V11.02H48.77V5.46H54.46V11.02H60.97V15.57H54.46V27.14C54.46 29.51 55.64 30.78 57.83 30.78C59.01 30.78 60.15 30.46 61.02 29.78L62.61 33.83L62.62 33.84Z"
                                    fill="#00B0DB" />
                                <path
                                    d="M66.54 3.42C66.54 1.51 68.09 0 70.18 0C72.27 0 73.82 1.41 73.82 3.28C73.82 5.28 72.32 6.83 70.18 6.83C68.04 6.83 66.54 5.33 66.54 3.41V3.42ZM67.31 10.84H73V35.16H67.31V10.84Z"
                                    fill="#00B0DB" />
                                <path
                                    d="M99.47 30.61V35.16H78.47V31.56L91.82 15.39H78.75V10.84H99.11V14.44L85.72 30.61H99.48H99.47Z"
                                    fill="#00B0DB" />
                                <path
                                    d="M127.12 24.82H108.04C108.72 28.37 111.68 30.65 115.92 30.65C118.65 30.65 120.79 29.78 122.52 28.01L125.57 31.52C123.38 34.12 119.97 35.48 115.78 35.48C107.63 35.48 102.34 30.24 102.34 23C102.34 15.76 107.67 10.57 114.91 10.57C122.15 10.57 127.21 15.53 127.21 23.14C127.21 23.6 127.16 24.28 127.12 24.83V24.82ZM107.99 21.04H121.79C121.33 17.53 118.65 15.12 114.91 15.12C111.17 15.12 108.53 17.49 107.99 21.04Z"
                                    fill="#00B0DB" />
                                <path
                                    d="M156.63 21.23V35.17H150.94V21.96C150.94 17.63 148.8 15.54 145.15 15.54C141.1 15.54 138.36 18 138.36 22.87V35.17H132.67V10.84H138.09V13.98C139.96 11.75 142.92 10.56 146.47 10.56C152.3 10.56 156.63 13.89 156.63 21.22V21.23Z"
                                    fill="#00B0DB" />
                                <path
                                    d="M225.54 21.23V35.17H219.85V21.96C219.85 17.63 217.71 15.54 214.07 15.54C210.02 15.54 207.28 18 207.28 22.87V35.17H201.59V10.84H207.01V13.98C208.88 11.75 211.84 10.56 215.39 10.56C221.22 10.56 225.55 13.89 225.55 21.22L225.54 21.23Z"
                                    fill="#00B0DB" />
                                <path
                                    d="M255.78 24.82H236.7C237.38 28.37 240.34 30.65 244.58 30.65C247.31 30.65 249.45 29.78 251.18 28.01L254.23 31.52C252.04 34.12 248.63 35.48 244.44 35.48C236.29 35.48 231 30.24 231 23C231 15.76 236.33 10.57 243.57 10.57C250.81 10.57 255.87 15.53 255.87 23.14C255.87 23.6 255.83 24.28 255.78 24.83V24.82ZM236.65 21.04H250.45C249.99 17.53 247.31 15.12 243.57 15.12C239.83 15.12 237.19 17.49 236.65 21.04Z"
                                    fill="#00B0DB" />
                                <path
                                    d="M257.6 35.09H257.64H257.62H257.6ZM257.69 35.13V35.1V35.12H257.67V35.1L257.66 35.13V35.09L257.68 35.12L257.7 35.09V35.13H257.69Z"
                                    fill="#00B0DB" />
                                <path
                                    d="M179.19 40.06C189.678 40.06 198.18 31.5579 198.18 21.07C198.18 10.5821 189.678 2.08 179.19 2.08C168.702 2.08 160.2 10.5821 160.2 21.07C160.2 31.5579 168.702 40.06 179.19 40.06Z"
                                    fill="#00607A" stroke="#F3F9EE" stroke-miterlimit="10" />
                                <path
                                    d="M179.13 33.06C185.719 33.06 191.06 27.7188 191.06 21.13C191.06 14.5412 185.719 9.2 179.13 9.2C172.541 9.2 167.2 14.5412 167.2 21.13C167.2 27.7188 172.541 33.06 179.13 33.06Z"
                                    fill="#F3F9EE" stroke="white" stroke-miterlimit="10" />
                                <path d="M258.46 2.71H255.91V1.5H262.45V2.71H259.9V9.2H258.47V2.71H258.46Z"
                                    fill="#00B0DB" />
                                <path
                                    d="M270.59 9.2V4.1L268.05 8.32H267.41L264.88 4.16V9.2H263.52V1.5H264.7L267.76 6.61L270.76 1.5H271.94V9.2H270.6H270.59Z"
                                    fill="#00B0DB" />
                            </g>
                            <defs>
                                <clipPath id="clip0_view_report">
                                    <rect width="271.95" height="40.56" fill="white" />
                                </clipPath>
                            </defs>
                        </svg>
                    </div>
                    <p v-if="report?.model?.citizen" class="text-lg font-semibold mb-2">
                        Borgerens navn: {{ report?.model?.citizen?.firstname }} {{ report?.model?.citizen?.lastname }}
                    </p>
                    <p class="font-semibold text-lg">{{ report?.form?.title }}</p>
                    <p class="text-sm mb-4">{{ report?.form?.description }}</p>
                    <div v-if="report?.field_response?.length > 0">
                        <div v-for="(fieldResponse, fieldIndex) in report?.field_response"
                            :key="fieldIndex"
                            class="bg-gray-100 rounded-md mt-4 p-4"
                            style="border-top: 2px solid #174560;">

                            <!-- TEXTFIELD -->
                            <template v-if="parseField(fieldResponse)?.type === 'textfield'">
                                <p class="mb-3">{{ fieldIndex + 1 }}. {{ parseField(fieldResponse)?.value }}</p>
                                <div class="px-4">
                                    <div class="w-full px-3 py-3 rounded-md text-sm bg-white"
                                        style="border: 1px solid #174560;">
                                        {{ fieldResponse.response || '' }}
                                    </div>
                                </div>
                            </template>

                            <!-- TEXTAREA -->
                            <template v-else-if="parseField(fieldResponse)?.type === 'textarea'">
                                <p class="mb-3">{{ fieldIndex + 1 }}. {{ parseField(fieldResponse)?.value }}</p>
                                <div class="px-4">
                                    <div class="w-full px-3 py-3 rounded-md text-sm bg-white whitespace-pre-wrap min-h-[6rem]"
                                        style="border: 1px solid #174560;">
                                        {{ fieldResponse.response || '' }}
                                    </div>
                                </div>
                            </template>

                            <!-- DATEFIELD -->
                            <template v-else-if="parseField(fieldResponse)?.type === 'datefield'">
                                <p class="mb-3">{{ fieldIndex + 1 }}. {{ parseField(fieldResponse)?.value }}</p>
                                <div class="px-4">
                                    <div class="w-full px-3 py-3 rounded-md text-sm bg-white"
                                        style="border: 1px solid #174560;">
                                        {{ fieldResponse.response || '' }}
                                    </div>
                                </div>
                            </template>

                            <!-- CHOICE (Radio) -->
                            <template v-else-if="parseField(fieldResponse)?.type === 'choice'">
                                <p class="mb-3">{{ fieldIndex + 1 }}. {{ parseField(fieldResponse)?.value }}</p>
                                <div class="px-4 space-y-2">
                                    <label v-for="(option, optionIndex) in parseField(fieldResponse)?.options"
                                        :key="optionIndex"
                                        class="flex items-center gap-x-2 text-sm">
                                        <input type="radio"
                                            :checked="fieldResponse.response === option"
                                            disabled
                                            class="h-4 w-4 accent-[#174560]" />
                                        {{ option }}
                                    </label>
                                </div>
                            </template>

                            <!-- CHECKBOX -->
                            <template v-else-if="parseField(fieldResponse)?.type === 'checkbox'">
                                <p class="mb-3">{{ fieldIndex + 1 }}. {{ parseField(fieldResponse)?.value }}</p>
                                <div class="px-4 space-y-2">
                                    <label v-for="(option, optionIndex) in parseField(fieldResponse)?.options"
                                        :key="optionIndex"
                                        class="flex items-center gap-x-2 text-sm">
                                        <span class="text-xl leading-none" style="font-family: 'DejaVu Sans', sans-serif;">
                                            {{ isCheckboxChecked(fieldResponse.response, option) ? '☑' : '☐' }}
                                        </span>
                                        {{ option }}
                                    </label>
                                </div>
                            </template>

                            <!-- RATING -->
                            <template v-else-if="parseField(fieldResponse)?.type === 'rating'">
                                <p class="mb-3">{{ fieldIndex + 1 }}. {{ parseField(fieldResponse)?.value }}</p>
                                <div class="flex gap-x-2">
                                    <div v-for="(level, levelIndex) in parseField(fieldResponse)?.levels"
                                        :key="levelIndex"
                                        class="flex-1 text-center py-3 rounded text-sm"
                                        :class="Number(fieldResponse.response) === Number(level)
                                            ? 'text-white'
                                            : 'bg-white'"
                                        :style="Number(fieldResponse.response) === Number(level)
                                            ? 'background-color: #174560; border: 1px solid #174560;'
                                            : 'border: 1px solid #ccc;'">
                                        {{ level }}
                                    </div>
                                </div>
                            </template>

                            <!-- UPLOADFILE -->
                            <template v-else>
                                <p class="mb-3">{{ fieldIndex + 1 }}. {{ parseField(fieldResponse)?.value }}</p>
                                <div class="px-4">
                                    <a v-if="fieldResponse.response"
                                        :href="fieldResponse.response"
                                        target="_blank"
                                        class="text-blue-600 underline">
                                        {{ fieldResponse.response }}
                                    </a>
                                    <span v-else class="text-sm text-gray-400">-</span>
                                </div>
                            </template>
                        </div>
                    </div>

                    <div v-else class="text-center text-sm text-gray-500 py-4">
                        {{ $t('plansandgoals.noDataAvailable') }}
                    </div>

                    <div class="flex justify-between gap-4 mt-6">
                        <FormButton type="button" buttonStyle="primary" class="rounded-md flex-1" @click="downloadReport" :disabled="state.isDownloading">
                            <Icon v-if="!state.isDownloading" name="ph:download" class="size-4" />
                            {{ $t('plansandgoals.table.actions.download') }}
                        </FormButton>
                        <FormButton type="button" buttonStyle="cancel" class="flex-1" @click="closeModal">
                            {{ $t('close') }}
                        </FormButton>
                    </div>
                </div>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { planGoalSubgoalService } from '@/components/api/user/PlanGoalSubgoalService'
import { saveAs } from 'file-saver'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    report: {
        type: Object,
        default: () => ({}),
    },
})

const emit = defineEmits(['close'])

const state = reactive({
    isDownloading: false,
    error: '' as string,
})

function closeModal() {
    emit('close')
}

function parseField(fieldResponse: any) {
    try {
        return JSON.parse(fieldResponse?.form_field?.field)
    } catch {
        return {}
    }
}

function isCheckboxChecked(response: any, option: string): boolean {
    if (Array.isArray(response)) {
        return response.includes(option)
    }
    if (typeof response === 'string') {
        try {
            const parsed = JSON.parse(response)
            if (Array.isArray(parsed)) {
                return parsed.includes(option)
            }
        } catch {
        }
    }
    return false
}

async function downloadReport() {
    state.isDownloading = true
    state.error = ''
    try {
        const attachmentUuid = props.report?.uuid
        const response = await planGoalSubgoalService.downloadPlanGoalSubgoalStatuses(attachmentUuid)
        if (response) {
            const filename = props.report?.form?.document_title ||
                props.report?.form?.title ||
                props.report?.title ||
                "report"
            saveAs(response, `${filename}.pdf`)
        }
    } catch (error: any) {
        state.error = error?.message || 'An error occurred during the download.'
    }
    state.isDownloading = false
}
</script>
