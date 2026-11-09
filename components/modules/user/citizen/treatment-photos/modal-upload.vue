<template>
    <Modal size="sm" :title="$t('treatmentPhotos.upload.title')" :show="props.isModalOpen" @close="closeModal">
        <template #modal-body>
            <LoadingSpinner :isActive="state.isUploading">
                <div class="space-y-4">
                    <Alert type="danger" :text="state.error" v-if="state.error" />

                    <div>
                        <input type="file" ref="fileInput" multiple :accept="ACCEPT" class="hidden"
                            @change="onFilesSelected" />
                        <button type="button" @click="fileInput?.click()"
                            class="flex w-full items-center justify-between rounded-lg border border-dashed border-gray-400 p-4 text-left text-sm hover:border-primary">
                            <span>{{ $t('treatmentPhotos.upload.chooseFiles') }}</span>
                            <Icon name="ph:upload-simple" class="size-6 text-gray-600" aria-hidden="true" />
                        </button>
                        <p class="mt-1 text-xs text-gray-500">{{ $t('treatmentPhotos.upload.fileHelp') }}</p>

                        <ul class="mt-2 space-y-1" v-if="state.files.length">
                            <li v-for="(file, index) in state.files" :key="file.name + file.size"
                                class="flex items-center justify-between gap-2 rounded-md bg-gray-50 px-3 py-1.5 text-sm text-gray-700">
                                <span class="truncate">{{ file.name }}</span>
                                <button type="button" :aria-label="$t('treatmentPhotos.upload.removeFile')"
                                    @click="removeFile(index)" class="text-gray-400 hover:text-red-600">
                                    <Icon name="heroicons:x-mark" class="size-4" />
                                </button>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <FormLabel for="taken_at" :label="$t('treatmentPhotos.dateTaken')" />
                        <FormDateField id="taken_at" name="taken_at" v-model="state.takenAt"
                            :placeholder="$t('treatmentPhotos.dateTaken')" :maxDate="today" />
                    </div>

                    <div>
                        <FormLabel for="milestone" :label="$t('treatmentPhotos.milestone')" />
                        <FormSelect id="milestone" v-model="state.milestone" :options="milestoneOptions"
                            :canClear="false" :canDeselect="false" :searchable="false" openDirection="top" />
                        <p class="mt-1 text-xs text-gray-500" v-if="state.milestone === AUTO">
                            <template v-if="state.suggestion">
                                {{ $t('treatmentPhotos.upload.suggested', { name: state.suggestion.name }) }}
                            </template>
                            <template v-else>{{ autoHint }}</template>
                        </p>
                    </div>

                    <div class="flex gap-x-3 pt-2">
                        <FormButton buttonStyle="cancel" class="w-full" @click="closeModal">
                            {{ $t('cancel') }}
                        </FormButton>
                        <FormButton buttonStyle="primary" class="w-full"
                            :disabled="state.files.length === 0 || state.isUploading" @click="submit">
                            {{ $t('treatmentPhotos.upload.submit') }}
                        </FormButton>
                    </div>
                </div>
            </LoadingSpinner>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useI18n } from 'vue-i18n'

const ACCEPT = '.jpg,.jpeg,.png,.heic,.heif,.webp'
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'heic', 'heif', 'webp']
const MAX_FILES = 10
const MAX_BYTES = 10 * 1024 * 1024
const AUTO = 'auto'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    milestones: {
        type: Array as () => any[],
        required: false,
        default: () => [],
    },
    // Sends the form: (formData) => response. Staff and patient pages each pass
    // their own endpoint.
    upload: {
        type: Function as unknown as () => (formData: FormData) => Promise<any>,
        required: true,
    },
    // Staff only: (takenAt) => milestone the server would pick, or null.
    suggest: {
        type: Function as unknown as () => (takenAt: string) => Promise<any>,
        required: false,
    },
    hasStartDate: {
        type: Boolean,
        required: false,
        default: false,
    },
    isPatient: {
        type: Boolean,
        required: false,
        default: false,
    },
})

const emit = defineEmits(['close', 'uploaded'])
const { t } = useI18n()

const today = moment().format('YYYY-MM-DD')
const fileInput = ref<HTMLInputElement | null>(null)

const state = reactive({
    files: [] as File[],
    takenAt: today,
    milestone: AUTO as string,
    suggestion: null as any,
    error: '' as string,
    isUploading: false,
})

const milestoneOptions = computed(() => [
    { value: AUTO, label: t('treatmentPhotos.upload.auto') },
    ...[...props.milestones]
        .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((milestone: any) => ({ value: milestone.uuid, label: milestone.name })),
])

const autoHint = computed(() => {
    if (props.isPatient) return t('treatmentPhotos.upload.autoHintPatient')
    return props.hasStartDate ? t('treatmentPhotos.upload.autoHint') : t('treatmentPhotos.upload.autoNoStart')
})

function closeModal() {
    emit('close')
}

function reset() {
    state.files = []
    state.takenAt = today
    state.milestone = AUTO
    state.suggestion = null
    state.error = ''
    state.isUploading = false
    if (fileInput.value) fileInput.value.value = ''
}

function extensionOf(file: File): string {
    return file.name.split('.').pop()?.toLowerCase() ?? ''
}

function onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement
    const picked = Array.from(input.files ?? [])
    state.error = ''

    for (const file of picked) {
        if (!ALLOWED_EXTENSIONS.includes(extensionOf(file))) {
            state.error = t('treatmentPhotos.upload.invalidType', { name: file.name })
            continue
        }
        if (file.size > MAX_BYTES) {
            state.error = t('treatmentPhotos.upload.tooLarge', { name: file.name })
            continue
        }
        if (state.files.some((existing) => existing.name === file.name && existing.size === file.size)) continue
        if (state.files.length >= MAX_FILES) {
            state.error = t('treatmentPhotos.upload.tooMany')
            break
        }
        state.files.push(file)
    }

    // So the same file can be picked again after being removed.
    input.value = ''
}

function removeFile(index: number) {
    state.files.splice(index, 1)
}

async function refreshSuggestion() {
    state.suggestion = null
    if (!props.isModalOpen || !props.suggest || !props.hasStartDate || !state.takenAt || state.milestone !== AUTO) return

    const asked = state.takenAt
    try {
        const response = await props.suggest(asked)
        // The date may have changed while waiting.
        if (asked === state.takenAt) state.suggestion = response?.data ?? null
    } catch {
        state.suggestion = null
    }
}

watch(() => props.isModalOpen, (open: boolean) => {
    if (open) reset()
    refreshSuggestion()
})
watch(() => [state.takenAt, state.milestone, props.hasStartDate], refreshSuggestion)

async function submit() {
    if (state.files.length === 0) return

    state.error = ''
    state.isUploading = true
    try {
        const formData = new FormData()
        state.files.forEach((file) => formData.append('files[]', file))
        if (state.takenAt) formData.append('taken_at', state.takenAt)
        if (state.milestone && state.milestone !== AUTO) formData.append('milestone_uuid', state.milestone)

        const response = await props.upload(formData)
        if (response?.data) {
            emit('uploaded', response.data)
            closeModal()
        }
    } catch (error: any) {
        const firstFieldError = error?.errors ? (Object.values(error.errors)[0] as any)?.[0] : null
        state.error = firstFieldError ?? error?.message ?? t('alert.somethingWentWrong')
    }
    state.isUploading = false
}
</script>
