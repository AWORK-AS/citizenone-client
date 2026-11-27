<template>
    <div>
        <Modal size="md" :title="tt('standardDocuments.drive.audienceTitle')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="relative" data-testid="patient-standard-modal">
                    <form @submit.prevent="save" id="formPatientStandard">
                        <Alert type="danger" :text="state.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="space-y-4">
                            <div class="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 ring-1 ring-gray-200">
                                <Icon :name="props.selectedDocument?.type === 'folder' ? 'ph:folder-simple' : 'ph:file-text'"
                                    class="size-5 shrink-0 text-gray-500" aria-hidden="true" />
                                <span class="truncate text-sm font-medium text-gray-900">{{ props.selectedDocument?.name }}</span>
                            </div>

                            <fieldset class="space-y-2">
                                <legend class="sr-only">{{ tt('standardDocuments.drive.audienceTitle') }}</legend>
                                <label v-for="choice in choices" :key="choice.value"
                                    class="flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 ring-1 transition-colors"
                                    :class="state.audience === choice.value ? 'bg-sky-50 ring-sky-300' : 'ring-gray-200 hover:bg-gray-50'">
                                    <input type="radio" name="patient_standard_audience" :value="choice.value"
                                        v-model="state.audience" :data-testid="`patient-standard-${choice.value}`"
                                        class="mt-0.5 size-4 shrink-0 accent-sky-700" />
                                    <span class="min-w-0">
                                        <span class="block text-sm font-medium text-gray-900">{{ choice.label }}</span>
                                        <span class="block text-xs text-gray-500">{{ choice.hint }}</span>
                                    </span>
                                </label>
                            </fieldset>

                            <div v-if="state.audience === 'selected'" class="space-y-1">
                                <FormLabel for="patient_standard_citizens" :label="tt('standardDocuments.drive.audienceSelected')" />
                                <!-- Mounted per opening, so the search field has focus. -->
                                <FormCitizenPicker v-if="props.isModalOpen && !state.isCitizensLoading"
                                    id="patient_standard_citizens" :options="state.options.citizens"
                                    v-model="state.citizenUuids" />
                                <FormError :error="state.validationError" />
                                <FormError :error="state.error?.errors?.citizen_uuids?.[0]" />
                            </div>

                            <p class="text-sm text-gray-600">{{ tt('standardDocuments.drive.audienceNote') }}</p>
                        </div>
                        <div class="mt-6 grid grid-cols-1 gap-3" :class="isShared ? 'md:grid-cols-3' : 'md:grid-cols-2'">
                            <FormButton v-if="isShared" type="button" buttonStyle="danger" class="w-full"
                                data-testid="patient-standard-stop" :disabled="state.isSaving" @click="stop">
                                {{ tt('standardDocuments.drive.stop') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="cancel" @click="closeModal">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="submit" buttonStyle="primary" class="w-full" data-testid="patient-standard-save"
                                :disabled="state.isSaving || (state.audience === 'selected' && state.citizenUuids.length === 0)">
                                {{ tt('standardDocuments.drive.save') }}
                            </FormButton>
                        </div>
                    </form>
                    <div v-if="state.isSaving || state.isCitizensLoading"
                        class="absolute inset-0 z-50 flex items-center justify-center bg-white bg-opacity-60">
                        <Spinner :isActive="true" />
                    </div>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Modal from '@/components/modal/index.vue'
import Spinner from '@/components/loading/Spinner.vue'
import { standardDocumentService } from '@/components/api/user/StandardDocumentService'
import { citizenService } from '@/components/api/user/CitizenService'
import { useAlert } from '@/composables/alert'
import { useTerminology } from '@/composables/useTerminology'
import type { PickerOption } from '@/utils/citizenPicker'
import type { Error } from '@/types'

/**
 * Who sees a Drive file or folder as a standard document: every citizen, or chosen ones (AW-2026-11011).
 * Opened from Drive's "show to citizens" button, also to change who sees it or to stop.
 */

// The citizen list's "all citizens" pseudo row is a filter choice, not a citizen.
const ALL_CITIZENS_SENTINEL = 'all-citizens'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedDocument: {
        type: Object as () => Record<string, any>,
        required: true,
    },
})
const emit = defineEmits(['close', 'saved'])

const { t } = useI18n()
const { tt } = useTerminology()
const { successAlert } = useAlert()

const state = reactive({
    error: {} as Error,
    validationError: '',
    isSaving: false,
    isCitizensLoading: false,
    audience: 'all' as 'all' | 'selected',
    citizenUuids: [] as string[],
    allCount: null as number | null,
    options: {
        citizens: [] as PickerOption[],
    },
})

const isShared = computed(() => !!props.selectedDocument?.is_patient_standard)
const chosenNow = computed<{ uuid: string, name: string }[]>(() => props.selectedDocument?.patient_citizens ?? [])

const choices = computed(() => [
    {
        value: 'all' as const,
        label: tt('standardDocuments.drive.audienceAll'),
        hint: state.allCount === null ? '' : tt('standardDocuments.drive.audienceAllHint', { count: state.allCount }),
    },
    {
        value: 'selected' as const,
        label: tt('standardDocuments.drive.audienceSelected'),
        hint: tt('standardDocuments.drive.audienceSelectedHint'),
    },
])

watch(() => props.isModalOpen, (isOpen) => {
    if (!isOpen) return
    state.error = {} as Error
    state.validationError = ''
    state.citizenUuids = chosenNow.value.map(citizen => citizen.uuid)
    state.audience = state.citizenUuids.length > 0 ? 'selected' : 'all'
    fetchCount()
    fetchCitizens()
}, { immediate: true })

async function fetchCount() {
    state.allCount = null
    try {
        const response: any = await standardDocumentService.getPatientStandardCount()
        const count = Number(response?.data?.count)
        state.allCount = Number.isFinite(count) ? count : null
    } catch {
        // The choice still works; it just cannot name a number.
        state.allCount = null
    }
}

async function fetchCitizens() {
    state.isCitizensLoading = true
    try {
        const response = await citizenService.getAllCitizens({})
        const options: PickerOption[] = (response?.data ?? [])
            .filter((citizen: any) => citizen?.uuid && citizen.uuid !== ALL_CITIZENS_SENTINEL)
            .map((citizen: any) => ({
                value: citizen.uuid,
                label: `${citizen.firstname ?? ''} ${citizen.lastname ?? ''}`.trim(),
                pinned: !!citizen?.is_pinned,
                departments: citizen?.departments ?? [],
            }))
        // Someone chosen earlier stays listed, so saving never drops them by accident.
        for (const citizen of chosenNow.value) {
            if (!options.some(option => option.value === citizen.uuid)) {
                options.push({ value: citizen.uuid, label: citizen.name, pinned: false, departments: [] } as PickerOption)
            }
        }
        state.options.citizens = options
    } catch (error: any) {
        state.error = error
    }
    state.isCitizensLoading = false
}

async function save() {
    state.error = {} as Error
    state.validationError = ''
    const citizenUuids = state.audience === 'selected' ? state.citizenUuids : []

    if (state.audience === 'selected' && citizenUuids.length === 0) {
        state.validationError = tt('standardDocuments.drive.pickRequired')
        return
    }

    await send(true, citizenUuids, state.audience === 'selected' ? 'standardDocuments.drive.shownSelected' : 'standardDocuments.drive.shown')
}

async function stop() {
    await send(false, [], 'standardDocuments.drive.hidden')
}

async function send(on: boolean, citizenUuids: string[], message: string) {
    const uuid = props.selectedDocument?.uuid
    if (!uuid) return
    state.isSaving = true
    try {
        await standardDocumentService.setPatientStandard(uuid, on, citizenUuids)
        successAlert(`${t('alert.success')}!`, tt(message) + '.')
        emit('saved')
        closeModal()
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}

function closeModal() {
    emit('close')
}
</script>
