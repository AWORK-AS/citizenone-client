<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.tabs.treatmentPhotos') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks">
                    <template #custom-link>
                        <ModulesUserCitizenBreadcrumbTrail />
                    </template>
                </Breadcrumb>
            </template>

            <div class="space-y-5">

                <ModulesUserCitizenDetailsHeader />
                <ModulesUserCitizenJournalTabs />

                <Alert type="danger" :text="state.error" v-if="state.error" />
                <Alert type="default" :text="$t('treatmentPhotos.notAvailable')" v-if="!isEnabled" />

                <LoadingSpinner :isActive="state.isLoading" v-if="isEnabled">
                    <div class="space-y-5">
                        <div
                            class="flex flex-wrap items-end justify-between gap-4 rounded-lg bg-white px-4 py-5 shadow-sm ring-1 ring-gray-900/5 sm:p-6">
                            <div class="w-full max-w-xs">
                                <FormLabel for="treatment_started_at" :label="$t('treatmentPhotos.treatmentStart')" />
                                <FormDateField v-if="canUpdate" id="treatment_started_at" name="treatment_started_at"
                                    v-model="state.startedAt" :placeholder="$t('treatmentPhotos.treatmentStartPlaceholder')" />
                                <p v-else class="text-sm text-gray-900">{{ state.startedAt ? formatDate(state.startedAt) : '-' }}</p>
                                <p class="mt-1 text-xs text-gray-500">{{ tt('treatmentPhotos.treatmentStartHelp') }}</p>
                            </div>

                            <div class="flex flex-wrap items-center gap-2">
                                <template v-if="state.selectMode">
                                    <span class="text-xs text-gray-500">
                                        {{ $t('treatmentPhotos.selectedCount', { count: state.selected.length }) }}
                                    </span>
                                    <FormButton buttonStyle="primary" :disabled="state.selected.length !== 2"
                                        @click="openCompare">
                                        <Icon name="ph:columns" class="size-4" />
                                        {{ $t('treatmentPhotos.compare.button') }}
                                    </FormButton>
                                    <FormButton buttonStyle="cancel" @click="stopSelecting">
                                        {{ $t('cancel') }}
                                    </FormButton>
                                </template>
                                <template v-else>
                                    <FormButton buttonStyle="action" v-if="state.photos.length >= 2"
                                        @click="state.selectMode = true">
                                        <Icon name="ph:columns" class="size-4" />
                                        {{ $t('treatmentPhotos.compare.start') }}
                                    </FormButton>
                                    <FormButton buttonStyle="primary" v-if="canCreate"
                                        @click="state.modal.isUploadOpen = true">
                                        <Icon name="ph:camera" class="size-4" />
                                        {{ $t('treatmentPhotos.upload.button') }}
                                    </FormButton>
                                </template>
                            </div>
                        </div>

                        <Alert type="default" :text="$t('treatmentPhotos.compare.selectHint')"
                            v-if="state.selectMode" />

                        <div v-if="!state.isLoading && state.photos.length === 0"
                            class="rounded-lg bg-white px-4 py-10 text-center shadow-sm ring-1 ring-gray-900/5">
                            <Icon name="ph:camera" class="mx-auto size-10 text-gray-300" aria-hidden="true" />
                            <p class="mt-2 text-sm text-gray-500">{{ $t('treatmentPhotos.empty') }}</p>
                        </div>

                        <div class="rounded-lg bg-white px-4 py-5 shadow-sm ring-1 ring-gray-900/5 sm:p-6"
                            v-else-if="state.photos.length > 0">
                            <ModulesUserCitizenTreatmentPhotosGroupGrid :groups="groups" :loadImage="loadImage"
                                :allowEdit="canUpdate" :allowDelete="canDelete" :selectMode="state.selectMode"
                                :selected="state.selected" @toggle="toggleSelected" @edit="openEdit"
                                @delete="askDelete" />
                        </div>
                    </div>
                </LoadingSpinner>

                <ModulesUserCitizenTreatmentPhotosModalUpload :isModalOpen="state.modal.isUploadOpen"
                    :milestones="state.milestones" :hasStartDate="!!state.startedAt" :upload="uploadPhotos"
                    :suggest="suggestMilestone" @close="state.modal.isUploadOpen = false"
                    @uploaded="onUploaded" />
                <ModulesUserCitizenTreatmentPhotosModalEdit :isModalOpen="state.modal.isEditOpen"
                    :citizenUuid="citizenUuid" :photo="state.selectedPhoto" :milestones="state.milestones"
                    @close="state.modal.isEditOpen = false" @saved="fetchPhotos" />
                <ModulesUserCitizenTreatmentPhotosModalCompare :isModalOpen="state.modal.isCompareOpen"
                    :photos="comparePhotos" :loadImage="loadImage" @close="state.modal.isCompareOpen = false" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteOpen"
                    :message="$t('treatmentPhotos.confirmDelete') + '?'" @close="state.modal.isDeleteOpen = false"
                    @confirm="deletePhoto" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { treatmentPhotoService } from '@/components/api/user/TreatmentPhotoService'
import { groupPhotosByMilestone, useTreatmentPhotoImages } from '@/composables/treatmentPhotoHelpers'
import { useTreatmentPhotos } from '@/composables/useTreatmentPhotos'
import { useTerminology } from '@/composables/useTerminology'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const citizenUuid = route?.params?.uuid as string
const { t } = useI18n()
const { tt } = useTerminology()
const { successAlert } = useAlert()
const { isAtLeast, can } = usePermissions()
const { isEnabled } = useTreatmentPhotos()

const breadcrumbLinks = [
    { name: 'citizens.tabs.treatmentPhotos', translate: true, href: `/citizens/${citizenUuid}/treatment-photos` },
]

const state = reactive({
    error: '' as string,
    isLoading: false,
    photos: [] as any[],
    milestones: [] as any[],
    startedAt: '' as string,
    // The API answered 403 to a write: the button goes away for the rest of the visit.
    writeDenied: false,
    selectMode: false,
    selected: [] as string[],
    selectedPhoto: null as any,
    modal: {
        isUploadOpen: false,
        isEditOpen: false,
        isDeleteOpen: false,
        isCompareOpen: false,
    },
})

// The date the field last held as saved, so loading it does not save it again.
let savedStartedAt = ''

const { loadImage, release } = useTreatmentPhotoImages((photo: any) =>
    treatmentPhotoService.getPhotoFile(citizenUuid, photo.uuid),
)

// The same rights as a patient's documents: add, change and delete are separate.
const canCreate = computed(() =>
    !state.writeDenied && (isAtLeast('Admin') || can('create_citizen_document') || can('create')),
)
const canUpdate = computed(() =>
    !state.writeDenied && (isAtLeast('Admin') || can('update_citizen_document') || can('update')),
)
const canDelete = computed(() =>
    !state.writeDenied && (isAtLeast('Admin') || can('delete_citizen_document') || can('delete')),
)

const groups = computed(() => groupPhotosByMilestone(state.photos, state.milestones))

const comparePhotos = computed(() =>
    state.photos
        .filter((photo: any) => state.selected.includes(photo.uuid))
        .sort((a: any, b: any) => String(a.taken_at).localeCompare(String(b.taken_at))),
)

function formatDate(date: any) {
    return date ? moment(date).format('DD-MM-YYYY') : '-'
}

function noteWriteError(error: any) {
    if (error?.status === 403) state.writeDenied = true
    state.error = error?.message ?? t('alert.somethingWentWrong')
}

watch(isEnabled, (enabled: boolean) => {
    if (enabled) fetchPhotos()
}, { immediate: true })

async function fetchPhotos() {
    state.error = ''
    state.isLoading = true
    try {
        const response = await treatmentPhotoService.getPhotos(citizenUuid)
        state.photos = response?.data ?? []
        state.milestones = response?.meta?.milestones ?? []
        savedStartedAt = response?.meta?.treatment_started_at ?? ''
        state.startedAt = savedStartedAt
        // Photos that no longer exist cannot stay selected.
        state.selected = state.selected.filter((uuid) => state.photos.some((photo: any) => photo.uuid === uuid))
    } catch (error: any) {
        state.error = error?.message ?? t('alert.somethingWentWrong')
    }
    state.isLoading = false
}

watch(() => state.startedAt, async (value: string) => {
    if ((value ?? '') === savedStartedAt || !canUpdate.value) return

    state.error = ''
    try {
        const response = await treatmentPhotoService.updateTreatmentStart(citizenUuid, value || null)
        if (response?.data) {
            savedStartedAt = value ?? ''
            successAlert(`${t('alert.success')}!`, t('treatmentPhotos.alert.startSaved'))
            // Days since start depend on it.
            await fetchPhotos()
        }
    } catch (error: any) {
        noteWriteError(error)
        state.startedAt = savedStartedAt
    }
})

function uploadPhotos(formData: FormData) {
    return treatmentPhotoService.uploadPhotos(citizenUuid, formData).catch((error: any) => {
        if (error?.status === 403) state.writeDenied = true
        throw error
    })
}

function suggestMilestone(takenAt: string) {
    return treatmentPhotoService.suggestMilestone(citizenUuid, takenAt)
}

function onUploaded() {
    successAlert(`${t('alert.success')}!`, t('treatmentPhotos.alert.uploaded'))
    fetchPhotos()
}

function openEdit(photo: any) {
    state.selectedPhoto = photo
    state.modal.isEditOpen = true
}

function askDelete(photo: any) {
    state.selectedPhoto = photo
    state.modal.isDeleteOpen = true
}

async function deletePhoto() {
    const photo = state.selectedPhoto
    if (!photo) return

    state.error = ''
    try {
        await treatmentPhotoService.deletePhoto(citizenUuid, photo.uuid)
        release(photo.uuid)
        state.selected = state.selected.filter((uuid) => uuid !== photo.uuid)
        state.photos = state.photos.filter((item: any) => item.uuid !== photo.uuid)
        successAlert(`${t('alert.success')}!`, t('treatmentPhotos.alert.deleted'))
    } catch (error: any) {
        noteWriteError(error)
    }
}

function toggleSelected(photo: any) {
    if (state.selected.includes(photo.uuid)) {
        state.selected = state.selected.filter((uuid) => uuid !== photo.uuid)
    } else if (state.selected.length < 2) {
        state.selected = [...state.selected, photo.uuid]
    }
}

function stopSelecting() {
    state.selectMode = false
    state.selected = []
}

function openCompare() {
    if (state.selected.length !== 2) return
    state.modal.isCompareOpen = true
}
</script>
